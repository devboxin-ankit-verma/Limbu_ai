import type { AiStreamUsage } from "@limbu/ai-core";
import { AgentBus } from "../communication/bus";
import { AgentMemoryStore } from "../memory/store";
import { assertAgent } from "../registry";
import { classifyTask } from "../routing/router";
import { generateAgentCompletion } from "../runtime/generate";
import { buildSynthesisPrompt, executeSpecialistAgent } from "../runtime/specialist";
import type {
  AgentExecutionContext,
  AgentRunStep,
  BuiltinAgentKey,
  TaskRoute,
} from "../types";

export async function runSupervisedTask(input: {
  runId: string;
  task: string;
  context: AgentExecutionContext;
  route: TaskRoute;
  forcedAgent?: BuiltinAgentKey;
}): Promise<{
  content: string;
  usage: AiStreamUsage[];
  steps: AgentRunStep[];
  routedTo: BuiltinAgentKey;
  supportingAgents: BuiltinAgentKey[];
}> {
  const bus = new AgentBus(input.runId);
  const memory = new AgentMemoryStore(input.runId);
  const steps: AgentRunStep[] = [];
  const usages: AiStreamUsage[] = [];

  steps.push({
    agentKey: "supervisor",
    type: "route",
    metadata: {
      primary: input.route.primary,
      supporting: input.route.supporting,
      confidence: input.route.confidence,
      reason: input.route.reason,
    },
    timestamp: new Date().toISOString(),
  });

  await bus.send({
    from: "supervisor",
    type: "system",
    content: `Routing: ${input.route.reason}`,
    metadata: input.route as unknown as Record<string, unknown>,
  });

  await bus.delegate("supervisor", input.route.primary, input.task);

  const primary = await executeSpecialistAgent({
    agentKey: input.route.primary,
    task: input.task,
    context: input.context,
    runId: input.runId,
    bus,
    memory,
    steps,
  });
  usages.push(primary.usage);
  await bus.respond(input.route.primary, "supervisor", primary.content.slice(0, 1000));

  const supportingResults: Array<{ key: BuiltinAgentKey; content: string }> = [];

  for (const supportKey of input.route.supporting) {
    await bus.delegate("supervisor", supportKey, input.task);
    const support = await executeSpecialistAgent({
      agentKey: supportKey,
      task: input.task,
      context: input.context,
      runId: input.runId,
      bus,
      memory,
      steps,
    });
    usages.push(support.usage);
    supportingResults.push({ key: supportKey, content: support.content });
    await bus.respond(supportKey, "supervisor", support.content.slice(0, 1000));
  }

  if (supportingResults.length === 0) {
    return {
      content: primary.content,
      usage: usages,
      steps,
      routedTo: input.route.primary,
      supportingAgents: [],
    };
  }

  steps.push({
    agentKey: "supervisor",
    type: "synthesize",
    timestamp: new Date().toISOString(),
  });

  const supervisor = assertAgent("supervisor");
  const synthesis = await generateAgentCompletion({
    agent: supervisor,
    task: buildSynthesisPrompt(input.task, primary.content, supportingResults),
    context: input.context,
    runId: input.runId,
  });
  usages.push(synthesis.usage);

  return {
    content: synthesis.content,
    usage: usages,
    steps,
    routedTo: input.route.primary,
    supportingAgents: input.route.supporting,
  };
}

export function planTaskRoute(task: string, forcedAgent?: BuiltinAgentKey): TaskRoute {
  return classifyTask(task, forcedAgent);
}
