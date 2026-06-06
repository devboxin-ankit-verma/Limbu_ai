import type { AgentMessageType, AgentRunStatus, KnowledgeBaseScope } from "@limbu/db";
import type { AiStreamUsage } from "@limbu/ai-core";

export type BuiltinAgentKey =
  | "supervisor"
  | "research"
  | "coding"
  | "content"
  | "analytics";

export type AgentExecutionContext = {
  userId: string;
  workspaceId: string;
  organizationId: string;
  isSuperAdmin?: boolean;
};

export type KnowledgeScope = KnowledgeBaseScope;

export interface AgentDefinition {
  key: BuiltinAgentKey;
  name: string;
  description: string;
  goal: string;
  systemPrompt: string;
  tools: string[];
  knowledgeScopes: KnowledgeScope[];
  canDelegateTo: BuiltinAgentKey[];
  taskType: "research" | "coding" | "content" | "analytics" | "supervisor";
}

export interface TaskRoute {
  primary: BuiltinAgentKey;
  supporting: BuiltinAgentKey[];
  confidence: number;
  reason: string;
}

export interface AgentRunStep {
  agentKey: BuiltinAgentKey;
  type: "route" | "execute" | "delegate" | "synthesize" | "tool" | "rag";
  content?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface AgentRunRequest {
  task: string;
  agentKey?: BuiltinAgentKey;
  threadId?: string;
  input?: Record<string, unknown>;
  maxDelegations?: number;
}

export interface AgentRunResult {
  runId: string;
  status: AgentRunStatus;
  routedTo: BuiltinAgentKey;
  supportingAgents: BuiltinAgentKey[];
  content: string;
  usage: AiStreamUsage[];
  steps: AgentRunStep[];
}

export interface AgentMessageRecord {
  id: string;
  runId: string;
  fromAgentKey: string;
  toAgentKey: string | null;
  messageType: AgentMessageType;
  content: string;
  createdAt: Date;
}

export interface AgentMemoryRecord {
  agentKey: string;
  memoryKey: string;
  value: string;
}

export interface AgentRegistryEntry extends AgentDefinition {
  isBuiltin: true;
}
