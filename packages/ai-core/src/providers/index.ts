import type { ModelConfig, ProviderStreamRequest } from "../types";
import * as anthropic from "./anthropic";
import * as google from "./google";
import * as openai from "./openai";

export async function* streamWithProvider(
  request: ProviderStreamRequest,
): AsyncGenerator<{ type: "delta"; content: string } | { type: "usage"; promptTokens: number; completionTokens: number }> {
  switch (request.model.provider) {
    case "openai":
      yield* openai.streamOpenAi(request);
      break;
    case "anthropic":
      yield* anthropic.streamAnthropic(request);
      break;
    case "google":
      yield* google.streamGoogle(request);
      break;
    default:
      throw new Error(`Unsupported provider: ${String(request.model.provider)}`);
  }
}

export function getProviderForModel(model: ModelConfig) {
  return model.provider;
}
