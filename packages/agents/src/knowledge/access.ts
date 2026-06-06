import { KnowledgeBaseScope } from "@limbu/db";
import { retrieveKnowledgeContext } from "@limbu/rag";
import type { AgentRegistryEntry, AgentExecutionContext } from "../types";

export async function retrieveAgentKnowledge(input: {
  agent: AgentRegistryEntry;
  query: string;
  context: AgentExecutionContext;
  topK?: number;
}) {
  if (input.agent.knowledgeScopes.length === 0) {
    return { contextBlock: "", citations: [] };
  }

  return retrieveKnowledgeContext({
    query: input.query,
    organizationId: input.context.organizationId,
    workspaceId: input.context.workspaceId,
    userId: input.context.userId,
    scopes: input.agent.knowledgeScopes as KnowledgeBaseScope[],
    topK: input.topK ?? 5,
    hybrid: true,
  });
}

export function canAccessKnowledgeScope(
  agent: AgentRegistryEntry,
  scope: KnowledgeBaseScope,
): boolean {
  return agent.knowledgeScopes.includes(scope);
}
