import type { AiStreamUsage } from "@limbu/ai-core";
import { AgentBus } from "../communication/bus";
import { retrieveAgentKnowledge } from "../knowledge/access";
import { AgentMemoryStore } from "../memory/store";
import { assertAgent } from "../registry";
import { generateAgentCompletion } from "./generate";
import type {
  AgentExecutionContext,
  AgentRegistryEntry,
  AgentRunStep,
  BuiltinAgentKey,
} from "../types";

export async function executeSpecialistAgent(input: {
  agentKey: BuiltinAgentKey;
  task: string;
  context: AgentExecutionContext;
  runId: string;
  bus: AgentBus;
  memory: AgentMemoryStore;
  steps: AgentRunStep[];
}): Promise<{ content: string; usage: AiStreamUsage }> {
  const agent = assertAgent(input.agentKey);

  input.steps.push({
    agentKey: agent.key,
    type: "execute",
    content: input.task.slice(0, 200),
    timestamp: new Date().toISOString(),
  });

  await input.memory.set(agent.key, "last_task", input.task.slice(0, 2000));
  await input.memory.set(agent.key, "last_run_at", new Date().toISOString());

  let ragContext = "";
  if (agent.knowledgeScopes.length > 0) {
    try {
      const rag = await retrieveAgentKnowledge({
        agent,
        query: input.task,
        context: input.context,
      });
      ragContext = rag.contextBlock;
      input.steps.push({
        agentKey: agent.key,
        type: "rag",
        metadata: { citations: rag.citations.length },
        timestamp: new Date().toISOString(),
      });
    } catch {
      // continue without RAG
    }
  }

  const memoryBlock = await input.memory.toPromptBlock(agent.key);
  const messages = await input.bus.listMessages();
  const busContext =
    messages.length > 0
      ? messages
          .slice(-6)
          .map((m) => `[${m.fromAgentKey}${m.toAgentKey ? ` → ${m.toAgentKey}` : ""}] ${m.content.slice(0, 300)}`)
          .join("\n")
      : undefined;

  const result = await generateAgentCompletion({
    agent,
    task: input.task,
    context: input.context,
    ragContext,
    memoryBlock,
    busContext,
    runId: input.runId,
  });

  await input.memory.set(agent.key, "last_response", result.content.slice(0, 4000));

  input.steps.push({
    agentKey: agent.key,
    type: "execute",
    content: result.content.slice(0, 200),
    metadata: { completed: true },
    timestamp: new Date().toISOString(),
  });

  return result;
}

export function buildSynthesisPrompt(
  task: string,
  primaryContent: string,
  supporting: Array<{ key: BuiltinAgentKey; content: string }>,
): string {
  const sections = supporting
    .map((s) => `### ${s.key} agent\n${s.content}`)
    .join("\n\n");

  return `Original task:\n${task}\n\nPrimary agent response:\n${primaryContent}\n\nSupporting agent outputs:\n${sections}\n\nSynthesize a single cohesive answer for the user. Preserve citations and actionable recommendations.`;
}
