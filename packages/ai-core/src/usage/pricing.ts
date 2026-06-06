import type { ModelConfig } from "../types";

export function calculateUsageCost(
  model: ModelConfig,
  promptTokens: number,
  completionTokens: number,
): { costUsd: number; credits: number; totalTokens: number } {
  const inputCost = (promptTokens / 1000) * model.inputCostPer1kUsd;
  const outputCost = (completionTokens / 1000) * model.outputCostPer1kUsd;
  const costUsd = inputCost + outputCost;
  const totalTokens = promptTokens + completionTokens;
  const credits = Math.max(1, Math.ceil((totalTokens / 1000) * model.creditsPer1kTokens));
  return { costUsd, credits, totalTokens };
}
