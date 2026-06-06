import {
  AiGenerationType,
  AiMessageRole,
  PlanTier,
  prisma,
} from "@limbu/db";
import {
  listProviderTools,
  recordGenerationUsage,
  resolveModelChain,
  selectModel,
  streamProviderWithRetry,
  type AiStreamUsage,
} from "@limbu/ai-core";
import type { AgentExecutionContext, AgentRegistryEntry } from "../types";

export async function generateAgentCompletion(input: {
  agent: AgentRegistryEntry;
  task: string;
  context: AgentExecutionContext;
  ragContext?: string;
  memoryBlock?: string;
  busContext?: string;
  runId?: string;
}): Promise<{ content: string; usage: AiStreamUsage }> {
  const org = await prisma.organization.findUnique({
    where: { id: input.context.organizationId },
    select: { planTier: true },
  });
  const planTier = org?.planTier ?? PlanTier.free;

  const selection = selectModel({
    planTier,
    taskType: AiGenerationType.agent_step,
  });

  const systemPrompt = [
    input.agent.systemPrompt,
    input.memoryBlock ? `## Agent Memory\n${input.memoryBlock}` : "",
    input.busContext ? `## Agent Communications\n${input.busContext}` : "",
    input.ragContext,
  ]
    .filter(Boolean)
    .join("\n\n");

  const tools = input.agent.tools.length
    ? listProviderTools(input.agent.tools)
    : undefined;

  let lastError: unknown;

  for (const model of resolveModelChain(selection)) {
    let fullText = "";
    let promptTokens = 0;
    let completionTokens = 0;

    try {
      for await (const event of streamProviderWithRetry({
        model,
        systemPrompt,
        messages: [{ role: AiMessageRole.user, content: input.task }],
        maxOutputTokens: model.maxOutputTokens,
        tools,
      })) {
        if (event.type === "delta") {
          fullText += event.content;
        } else {
          promptTokens = event.promptTokens;
          completionTokens = event.completionTokens;
        }
      }

      const usage = await recordGenerationUsage({
        workspaceId: input.context.workspaceId,
        organizationId: input.context.organizationId,
        model,
        taskType: AiGenerationType.agent_step,
        promptTokens,
        completionTokens,
        input: {
          agentKey: input.agent.key,
          runId: input.runId,
          task: input.task.slice(0, 500),
        },
        output: { content: fullText.slice(0, 2000) },
        referenceId: input.runId,
      });

      return { content: fullText, usage };
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Agent generation failed");
}
