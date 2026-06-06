import { AiGenerationType, AiMessageRole, PlanTier, prisma } from "@limbu/db";
import { trimMessagesToWindow } from "./context/window";
import { AiCoreError, isAiCoreError } from "./errors";
import {
  loadConversationMemory,
  loadLatestUserMessage,
  mergeShortTermMemory,
} from "./memory/conversation";
import { getShortTermMemory } from "./memory/short-term";
import { resolveModelChain, selectModel } from "./model-router";
import { buildPromptLayers, composeSystemPrompt } from "./prompt-manager";
import { shouldFallbackProvider, streamProviderWithRetry } from "./reliability/fallback";
import { checkRateLimit } from "./reliability/rate-limit";
import { registerBuiltinTools, listProviderTools } from "./tools/registry";
import { retrieveKnowledgeContext } from "@limbu/rag";
import type { AiStreamEvent, OrchestratorChatRequest, WorkspaceAiSettings } from "./types";
import { recordGenerationUsage } from "./usage/tracker";

registerBuiltinTools();

export class AiOrchestrator {
  async *streamChat(request: OrchestratorChatRequest): AsyncGenerator<AiStreamEvent> {
    const streamStartedAt = Date.now();
    try {
      const { assertAiCredits } = await import("@limbu/billing");
      await assertAiCredits(request.organizationId, 1);

      checkRateLimit(`org:${request.organizationId}`);

      const org = await prisma.organization.findUnique({
        where: { id: request.organizationId },
        select: { planTier: true },
      });
      const planTier = request.planTier ?? org?.planTier ?? PlanTier.free;

      const workspace = await prisma.workspace.findUnique({
        where: { id: request.workspaceId },
        select: { settings: true },
      });
      const wsSettings = (workspace?.settings ?? {}) as WorkspaceAiSettings;

      const selection = selectModel({
        planTier,
        taskType: request.taskType ?? AiGenerationType.chat,
        provider: request.provider ?? wsSettings.preferredProvider,
        model: request.model ?? wsSettings.preferredModel,
      });

      const userMessage = await loadLatestUserMessage(request.threadId, request.userMessageId);
      if (!userMessage) {
        yield { type: "error", message: "User message not found", code: "MESSAGE_NOT_FOUND" };
        return;
      }

      const history = await loadConversationMemory(request.threadId, request.userMessageId);
      history.push({ role: AiMessageRole.user, content: userMessage.content });

      const promptLayers = await buildPromptLayers({
        workspaceId: request.workspaceId,
        taskType: request.taskType ?? AiGenerationType.chat,
        agentId: request.agentId,
      });

      let ragContext = "";
      if (request.ragEnabled !== false) {
        try {
          const rag = await retrieveKnowledgeContext({
            query: userMessage.content,
            organizationId: request.organizationId,
            workspaceId: request.workspaceId,
            userId: request.userId,
            knowledgeBaseIds: request.knowledgeBaseIds,
            topK: 5,
            hybrid: true,
          });
          ragContext = rag.contextBlock;
        } catch {
          // RAG is optional — continue without retrieved context
        }
      }

      const systemPrompt = [
        composeSystemPrompt(
          promptLayers,
          mergeShortTermMemory(
            request.shortTermMemory ??
              getShortTermMemory(request.organizationId, request.userId, request.threadId),
            undefined,
          ),
        ),
        ragContext,
      ]
        .filter(Boolean)
        .join("\n\n");

      const models = resolveModelChain(selection);
      let lastError: unknown;

      for (const model of models) {
        let fullText = "";
        let promptTokens = 0;
        let completionTokens = 0;

        try {
          const trimmedMessages = trimMessagesToWindow({
            systemPrompt,
            messages: history,
            maxContextTokens: model.maxContextTokens,
            reserveOutputTokens: model.maxOutputTokens,
          });

          const enabledTools = request.toolNames ?? wsSettings.enabledTools;
          const tools = enabledTools?.length ? listProviderTools(enabledTools) : undefined;

          for await (const event of streamProviderWithRetry({
            model,
            systemPrompt,
            messages: trimmedMessages,
            maxOutputTokens: model.maxOutputTokens,
            tools,
          })) {
            if (event.type === "delta") {
              fullText += event.content;
              yield { type: "delta", content: event.content };
            } else {
              promptTokens = event.promptTokens;
              completionTokens = event.completionTokens;
            }
          }

          const usage = await recordGenerationUsage({
            workspaceId: request.workspaceId,
            organizationId: request.organizationId,
            model,
            taskType: request.taskType ?? AiGenerationType.chat,
            promptTokens,
            completionTokens,
            input: {
              threadId: request.threadId,
              userMessageId: request.userMessageId,
              model: model.model,
              provider: model.provider,
            },
            output: { content: fullText },
            referenceId: request.userMessageId,
          });

          const { recordLatency, trackProductEvent, PRODUCT_EVENTS } = await import(
            "@limbu/analytics"
          );
          void recordLatency({
            name: "ai.chat.stream",
            durationMs: Date.now() - streamStartedAt,
            organizationId: request.organizationId,
            workspaceId: request.workspaceId,
          }).catch(() => {});
          void trackProductEvent({
            eventName: PRODUCT_EVENTS.CHAT_MESSAGE_SENT,
            userId: request.userId,
            organizationId: request.organizationId,
            workspaceId: request.workspaceId,
            properties: { model: model.model, credits: usage.credits },
          }).catch(() => {});

          yield { type: "done", content: fullText, usage };
          return;
        } catch (err) {
          lastError = err;
          if (!shouldFallbackProvider(err, fullText.length)) {
            break;
          }
        }
      }

      const message =
        lastError instanceof Error ? lastError.message : "All providers failed";
      yield {
        type: "error",
        message,
        code: lastError instanceof AiCoreError ? lastError.code : "PROVIDER_FAILED",
        retryable: lastError instanceof AiCoreError ? lastError.retryable : false,
      };
    } catch (err) {
      const { recordError } = await import("@limbu/analytics");
      void recordError({
        source: "ai.orchestrator",
        message: err instanceof Error ? err.message : "Orchestration failed",
        code: err instanceof AiCoreError ? err.code : "ORCHESTRATOR_ERROR",
        organizationId: request.organizationId,
        workspaceId: request.workspaceId,
        userId: request.userId,
      }).catch(() => {});

      yield {
        type: "error",
        message: err instanceof Error ? err.message : "Orchestration failed",
        code: err instanceof AiCoreError ? err.code : "ORCHESTRATOR_ERROR",
        retryable: err instanceof AiCoreError ? err.retryable : false,
      };
    }
  }
}

export const aiOrchestrator = new AiOrchestrator();

export async function orchestrateThreadReply(request: OrchestratorChatRequest) {
  return aiOrchestrator.streamChat(request);
}
