import { GoogleGenerativeAI } from "@google/generative-ai";
import { getProviderApiKey } from "../config";
import { ProviderNotConfiguredError } from "../errors";
import type { ProviderStreamRequest } from "../types";
import { estimateTokens } from "../context/window";

export async function* streamGoogle(
  request: ProviderStreamRequest,
): AsyncGenerator<{ type: "delta"; content: string } | { type: "usage"; promptTokens: number; completionTokens: number }> {
  const apiKey = getProviderApiKey("google");
  if (!apiKey) throw new ProviderNotConfiguredError("google");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: request.model.model,
    systemInstruction: request.systemPrompt,
  });

  const history = request.messages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  const last = request.messages.at(-1);

  const chat = model.startChat({ history });
  const result = await chat.sendMessageStream(last?.content ?? "");

  let full = "";
  for await (const chunk of result.stream) {
    const text = chunk.text();
    full += text;
    if (text) yield { type: "delta", content: text };
  }

  yield {
    type: "usage",
    promptTokens: estimateTokens(request.systemPrompt + request.messages.map((m) => m.content).join("\n")),
    completionTokens: estimateTokens(full),
  };
}
