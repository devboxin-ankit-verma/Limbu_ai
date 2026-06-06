import { AiMessageRole, prisma } from "@limbu/db";
import type { ChatMessage } from "../types";

export async function loadConversationMemory(
  threadId: string,
  excludeMessageId?: string,
): Promise<ChatMessage[]> {
  const messages = await prisma.aiMessage.findMany({
    where: {
      threadId,
      role: { in: [AiMessageRole.user, AiMessageRole.assistant, AiMessageRole.system] },
      ...(excludeMessageId ? { NOT: { id: excludeMessageId } } : {}),
    },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    select: { role: true, content: true, id: true },
  });

  return messages.map((m) => ({ role: m.role, content: m.content }));
}

export async function loadLatestUserMessage(
  threadId: string,
  userMessageId: string,
): Promise<{ content: string } | null> {
  const message = await prisma.aiMessage.findFirst({
    where: { id: userMessageId, threadId, role: AiMessageRole.user },
    select: { content: true },
  });
  return message;
}

export function mergeShortTermMemory(
  base?: Record<string, string>,
  extra?: Record<string, string>,
): Record<string, string> | undefined {
  if (!base && !extra) return undefined;
  return { ...(base ?? {}), ...(extra ?? {}) };
}
