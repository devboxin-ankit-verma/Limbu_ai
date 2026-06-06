import Anthropic from "@anthropic-ai/sdk";
import { getProviderApiKey } from "../config";
import { ProviderNotConfiguredError } from "../errors";
import type { ProviderStreamRequest } from "../types";

export async function* streamAnthropic(
  request: ProviderStreamRequest,
): AsyncGenerator<{ type: "delta"; content: string } | { type: "usage"; promptTokens: number; completionTokens: number }> {
  const apiKey = getProviderApiKey("anthropic");
  if (!apiKey) throw new ProviderNotConfiguredError("anthropic");

  const client = new Anthropic({ apiKey });
  const stream = await client.messages.stream({
    model: request.model.model,
    max_tokens: request.maxOutputTokens,
    system: request.systemPrompt,
    messages: request.messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
        content: m.content,
      })),
  });

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      yield { type: "delta", content: event.delta.text };
    }
  }

  const final = await stream.finalMessage();
  yield {
    type: "usage",
    promptTokens: final.usage.input_tokens,
    completionTokens: final.usage.output_tokens,
  };
}
