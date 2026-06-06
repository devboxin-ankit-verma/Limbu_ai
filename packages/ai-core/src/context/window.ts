import type { ChatMessage } from "../types";

const APPROX_CHARS_PER_TOKEN = 4;

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / APPROX_CHARS_PER_TOKEN);
}

export function estimateMessagesTokens(messages: ChatMessage[], systemPrompt: string): number {
  const systemTokens = estimateTokens(systemPrompt);
  const messageTokens = messages.reduce((sum, m) => sum + estimateTokens(m.content) + 4, 0);
  return systemTokens + messageTokens;
}

export function trimMessagesToWindow(input: {
  systemPrompt: string;
  messages: ChatMessage[];
  maxContextTokens: number;
  reserveOutputTokens: number;
}): ChatMessage[] {
  const budget = input.maxContextTokens - input.reserveOutputTokens - estimateTokens(input.systemPrompt);
  if (budget <= 0) return [];

  const reversed = [...input.messages].reverse();
  const kept: ChatMessage[] = [];
  let used = 0;

  for (const message of reversed) {
    const cost = estimateTokens(message.content) + 4;
    if (used + cost > budget) break;
    kept.push(message);
    used += cost;
  }

  return kept.reverse();
}
