import { PlanTier } from "@limbu/db";
import { DEFAULT_FALLBACK_CHAIN, MODEL_CATALOG, isProviderConfigured } from "./config";
import type { AiTaskType, ModelConfig, ModelSelection, ProviderName } from "./types";

const PLAN_DEFAULT_MODEL: Record<PlanTier, string> = {
  free: "gpt-4o-mini",
  starter: "gpt-4o-mini",
  pro: "gpt-4o",
  team: "gpt-4o",
  enterprise: "claude-3-5-sonnet-latest",
};

const TASK_MODEL_OVERRIDES: Partial<Record<AiTaskType, string>> = {
  chat: "gpt-4o-mini",
  post: "gpt-4o",
  review_reply: "gpt-4o-mini",
  qa_answer: "gpt-4o-mini",
  agent_step: "claude-3-5-sonnet-latest",
};

function getModelConfig(modelId: string): ModelConfig | null {
  return MODEL_CATALOG[modelId] ?? null;
}

function configuredFallbacks(excludeModel: string): ModelConfig[] {
  return DEFAULT_FALLBACK_CHAIN.filter((id) => id !== excludeModel)
    .map((id) => getModelConfig(id))
    .filter((m): m is ModelConfig => m !== null && isProviderConfigured(m.provider));
}

export function listAvailableModels(): ModelConfig[] {
  return Object.values(MODEL_CATALOG).filter((m) => isProviderConfigured(m.provider));
}

export function selectModel(input: {
  planTier: PlanTier;
  taskType?: AiTaskType;
  provider?: ProviderName;
  model?: string;
}): ModelSelection {
  let modelId = input.model;

  if (!modelId && input.provider) {
    modelId = Object.values(MODEL_CATALOG).find((m) => m.provider === input.provider)?.model;
  }

  if (!modelId) {
    modelId = (input.taskType && TASK_MODEL_OVERRIDES[input.taskType]) ?? PLAN_DEFAULT_MODEL[input.planTier];
  }

  const primary = getModelConfig(modelId);
  if (!primary) {
    const firstConfigured = listAvailableModels()[0];
    if (!firstConfigured) {
      throw new Error("No AI providers are configured");
    }
    return { primary: firstConfigured, fallbacks: configuredFallbacks(firstConfigured.model) };
  }

  if (!isProviderConfigured(primary.provider)) {
    const fallbacks = configuredFallbacks(primary.model);
    if (fallbacks.length === 0) throw new Error(`Provider ${primary.provider} is not configured`);
    return { primary: fallbacks[0], fallbacks: fallbacks.slice(1) };
  }

  return { primary, fallbacks: configuredFallbacks(primary.model) };
}

export function resolveModelChain(selection: ModelSelection): ModelConfig[] {
  return [selection.primary, ...selection.fallbacks];
}
