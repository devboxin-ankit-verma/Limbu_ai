import OpenAI from "openai";
import { getProviderApiKey } from "../config";
import { ProviderNotConfiguredError } from "../errors";
import type {
  ProviderStreamRequest,
  ProviderStreamResult,
  ProviderToolDefinition,
} from "../types";

export async function* streamOpenAi(
  request: ProviderStreamRequest,
): AsyncGenerator<{ type: "delta"; content: string } | { type: "usage"; promptTokens: number; completionTokens: number }> {
  const apiKey = getProviderApiKey("openai");
  if (!apiKey) throw new ProviderNotConfiguredError("openai");

  const client = new OpenAI({ apiKey });
  const messages = [
    { role: "system" as const, content: request.systemPrompt },
    ...request.messages.map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    })),
  ];

  const stream = await client.chat.completions.create({
    model: request.model.model,
    messages,
    max_tokens: request.maxOutputTokens,
    stream: true,
    stream_options: { include_usage: true },
    tools: request.tools?.length
      ? request.tools.map((tool) => ({
          type: "function" as const,
          function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters,
          },
        }))
      : undefined,
  });

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) yield { type: "delta", content: delta };
    if (chunk.usage) {
      yield {
        type: "usage",
        promptTokens: chunk.usage.prompt_tokens ?? 0,
        completionTokens: chunk.usage.completion_tokens ?? 0,
      };
    }
  }
}

export async function completeOpenAi(request: ProviderStreamRequest): Promise<ProviderStreamResult> {
  const apiKey = getProviderApiKey("openai");
  if (!apiKey) throw new ProviderNotConfiguredError("openai");

  const client = new OpenAI({ apiKey });
  const response = await client.chat.completions.create({
    model: request.model.model,
    messages: [
      { role: "system", content: request.systemPrompt },
      ...request.messages.map((m) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      })),
    ],
    max_tokens: request.maxOutputTokens,
    tools: request.tools?.length
      ? request.tools.map((tool: ProviderToolDefinition) => ({
          type: "function" as const,
          function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters,
          },
        }))
      : undefined,
  });

  const choice = response.choices[0];
  const toolCalls = choice?.message?.tool_calls?.map((call) => ({
    id: call.id,
    name: call.function.name,
    arguments: JSON.parse(call.function.arguments || "{}") as Record<string, unknown>,
  }));

  return {
    content: choice?.message?.content ?? "",
    usage: {
      promptTokens: response.usage?.prompt_tokens ?? 0,
      completionTokens: response.usage?.completion_tokens ?? 0,
      totalTokens: response.usage?.total_tokens ?? 0,
    },
    toolCalls,
  };
}
