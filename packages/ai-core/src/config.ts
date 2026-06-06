import type { ProviderName } from "./types";
import type { ModelConfig } from "./types";

export function getProviderApiKey(provider: ProviderName): string | undefined {
  switch (provider) {
    case "openai":
      return process.env.OPENAI_API_KEY;
    case "anthropic":
      return process.env.ANTHROPIC_API_KEY;
    case "google":
      return process.env.GOOGLE_AI_API_KEY ?? process.env.GEMINI_API_KEY;
    default:
      return undefined;
  }
}

export function isProviderConfigured(provider: ProviderName): boolean {
  return Boolean(getProviderApiKey(provider));
}

export const MODEL_CATALOG: Record<string, ModelConfig> = {
  "gpt-4o": {
    provider: "openai",
    model: "gpt-4o",
    maxContextTokens: 128_000,
    maxOutputTokens: 4_096,
    inputCostPer1kUsd: 0.0025,
    outputCostPer1kUsd: 0.01,
    creditsPer1kTokens: 10,
  },
  "gpt-4o-mini": {
    provider: "openai",
    model: "gpt-4o-mini",
    maxContextTokens: 128_000,
    maxOutputTokens: 4_096,
    inputCostPer1kUsd: 0.00015,
    outputCostPer1kUsd: 0.0006,
    creditsPer1kTokens: 2,
  },
  "claude-3-5-sonnet-latest": {
    provider: "anthropic",
    model: "claude-3-5-sonnet-latest",
    maxContextTokens: 200_000,
    maxOutputTokens: 8_192,
    inputCostPer1kUsd: 0.003,
    outputCostPer1kUsd: 0.015,
    creditsPer1kTokens: 12,
  },
  "claude-3-5-haiku-latest": {
    provider: "anthropic",
    model: "claude-3-5-haiku-latest",
    maxContextTokens: 200_000,
    maxOutputTokens: 8_192,
    inputCostPer1kUsd: 0.0008,
    outputCostPer1kUsd: 0.004,
    creditsPer1kTokens: 3,
  },
  "gemini-2.0-flash": {
    provider: "google",
    model: "gemini-2.0-flash",
    maxContextTokens: 1_000_000,
    maxOutputTokens: 8_192,
    inputCostPer1kUsd: 0.0001,
    outputCostPer1kUsd: 0.0004,
    creditsPer1kTokens: 1,
  },
};

export const DEFAULT_FALLBACK_CHAIN: string[] = [
  "gpt-4o-mini",
  "gemini-2.0-flash",
  "claude-3-5-haiku-latest",
];
