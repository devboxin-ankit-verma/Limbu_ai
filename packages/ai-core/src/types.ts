import type { AiGenerationType, AiMessageRole, PlanTier } from "@limbu/db";

export type ProviderName = "openai" | "anthropic" | "google";

export type AiTaskType = AiGenerationType;

export interface ChatMessage {
  role: AiMessageRole;
  content: string;
}

export interface ModelConfig {
  provider: ProviderName;
  model: string;
  maxContextTokens: number;
  maxOutputTokens: number;
  inputCostPer1kUsd: number;
  outputCostPer1kUsd: number;
  creditsPer1kTokens: number;
}

export interface ModelSelection {
  primary: ModelConfig;
  fallbacks: ModelConfig[];
}

export interface PromptLayers {
  global: string;
  workspace?: string;
  agent?: string;
}

export interface OrchestratorChatRequest {
  threadId: string;
  userId: string;
  workspaceId: string;
  organizationId: string;
  planTier?: PlanTier;
  userMessageId: string;
  taskType?: AiTaskType;
  provider?: ProviderName;
  model?: string;
  agentId?: string;
  toolNames?: string[];
  shortTermMemory?: Record<string, string>;
  ragEnabled?: boolean;
  knowledgeBaseIds?: string[];
}

export interface AiStreamChunk {
  type: "delta";
  content: string;
}

export interface AiStreamUsage {
  provider: ProviderName;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUsd: number;
  credits: number;
}

export interface AiStreamDone {
  type: "done";
  content: string;
  usage: AiStreamUsage;
}

export interface AiStreamError {
  type: "error";
  message: string;
  code?: string;
  retryable?: boolean;
}

export type AiStreamEvent = AiStreamChunk | AiStreamDone | AiStreamError;

export interface ProviderStreamRequest {
  model: ModelConfig;
  systemPrompt: string;
  messages: ChatMessage[];
  maxOutputTokens: number;
  tools?: ProviderToolDefinition[];
}

export interface ProviderToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface ProviderStreamResult {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  toolCalls?: Array<{ id: string; name: string; arguments: Record<string, unknown> }>;
}

export interface WorkspaceAiSettings {
  systemPrompt?: string;
  preferredProvider?: ProviderName;
  preferredModel?: string;
  enabledTools?: string[];
}
