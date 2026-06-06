import { executeTool } from "@limbu/ai-core";
import { listProviderTools } from "@limbu/ai-core";
import type { AgentRegistryEntry } from "../types";
import type { AgentExecutionContext } from "../types";
import { AgentForbiddenError } from "../errors";

export function resolveAgentTools(agent: AgentRegistryEntry) {
  return listProviderTools(agent.tools);
}

export async function runAgentTool(input: {
  agent: AgentRegistryEntry;
  toolName: string;
  args: Record<string, unknown>;
  context: AgentExecutionContext;
  runId?: string;
}) {
  if (!input.agent.tools.includes(input.toolName)) {
    throw new AgentForbiddenError(`Agent '${input.agent.key}' cannot use tool '${input.toolName}'`);
  }

  return executeTool({
    toolName: input.toolName,
    args: input.args,
    context: {
      organizationId: input.context.organizationId,
      workspaceId: input.context.workspaceId,
      userId: input.context.userId,
      threadId: input.runId,
    },
    enabledTools: input.agent.tools,
  });
}
