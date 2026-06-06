import { AiMessageRole, prisma } from "@limbu/db";
import { requireThreadAccess } from "../access";
import { ChatNotFoundError, ChatValidationError } from "../errors";
import {
  DEFAULT_THREAD_TITLE,
  MESSAGES_PAGE_SIZE,
  type MessageRecord,
  type PaginatedMessages,
} from "../types";
import { editMessageSchema, listMessagesSchema, sendMessageSchema } from "../validators";

const messageSelect = {
  id: true,
  threadId: true,
  role: true,
  content: true,
  model: true,
  createdAt: true,
  updatedAt: true,
} as const;

function toMessageRecord(message: {
  id: string;
  threadId: string;
  role: AiMessageRole;
  content: string;
  model: string | null;
  createdAt: Date;
  updatedAt: Date;
}): MessageRecord {
  return {
    id: message.id,
    threadId: message.threadId,
    role: message.role,
    content: message.content,
    model: message.model,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
  };
}

export async function listMessages(
  threadId: string,
  userId: string,
  query?: { cursor?: string; limit?: number },
): Promise<PaginatedMessages> {
  await requireThreadAccess(threadId, userId);

  const parsed = listMessagesSchema.safeParse(query ?? {});
  if (!parsed.success) throw new ChatValidationError("Invalid query");

  const limit = parsed.data.limit ?? MESSAGES_PAGE_SIZE;

  const messages = await prisma.aiMessage.findMany({
    where: { threadId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    ...(parsed.data.cursor ? { cursor: { id: parsed.data.cursor }, skip: 1 } : {}),
    select: messageSelect,
  });

  const hasMore = messages.length > limit;
  const page = hasMore ? messages.slice(0, limit) : messages;

  return {
    messages: page.reverse().map(toMessageRecord),
    nextCursor: hasMore ? page[0]?.id ?? null : null,
    hasMore,
  };
}

export async function createUserMessage(
  threadId: string,
  userId: string,
  content: string,
) {
  const thread = await requireThreadAccess(threadId, userId, { write: true });

  const parsed = sendMessageSchema.safeParse({ content });
  if (!parsed.success) {
    throw new ChatValidationError(
      "Invalid message",
      parsed.error.flatten().fieldErrors as Record<string, string[]>,
    );
  }

  const trimmed = parsed.data.content.trim();

  const message = await prisma.$transaction(async (tx) => {
    const created = await tx.aiMessage.create({
      data: {
        threadId,
        workspaceId: thread.workspaceId,
        organizationId: thread.organizationId,
        role: AiMessageRole.user,
        content: trimmed,
      },
      select: messageSelect,
    });

    await tx.aiThread.update({
      where: { id: threadId },
      data: {
        lastMessageAt: new Date(),
        messageCount: { increment: 1 },
        summary: trimmed.slice(0, 280),
        ...(thread.title === DEFAULT_THREAD_TITLE || !thread.title
          ? { title: trimmed.slice(0, 80) || DEFAULT_THREAD_TITLE }
          : {}),
      },
    });

    return created;
  });

  const { trackProductEvent, PRODUCT_EVENTS } = await import("@limbu/analytics");
  void trackProductEvent({
    eventName: PRODUCT_EVENTS.CHAT_MESSAGE_SENT,
    userId,
    organizationId: thread.organizationId,
    workspaceId: thread.workspaceId,
    properties: { threadId },
  }).catch(() => {});

  return toMessageRecord(message);
}

export async function createAssistantMessage(
  threadId: string,
  userId: string,
  content: string,
  model?: string,
  tokensUsed?: number,
) {
  const thread = await requireThreadAccess(threadId, userId, { write: true });

  const message = await prisma.$transaction(async (tx) => {
    const created = await tx.aiMessage.create({
      data: {
        threadId,
        workspaceId: thread.workspaceId,
        organizationId: thread.organizationId,
        role: AiMessageRole.assistant,
        content,
        model: model ?? null,
        tokensUsed: tokensUsed ?? 0,
      },
      select: messageSelect,
    });

    await tx.aiThread.update({
      where: { id: threadId },
      data: {
        lastMessageAt: new Date(),
        messageCount: { increment: 1 },
        summary: content.slice(0, 280),
      },
    });

    return created;
  });

  return toMessageRecord(message);
}

export async function editUserMessage(
  threadId: string,
  messageId: string,
  userId: string,
  content: string,
) {
  await requireThreadAccess(threadId, userId, { write: true });

  const parsed = editMessageSchema.safeParse({ content });
  if (!parsed.success) {
    throw new ChatValidationError(
      "Invalid message",
      parsed.error.flatten().fieldErrors as Record<string, string[]>,
    );
  }

  const existing = await prisma.aiMessage.findFirst({
    where: { id: messageId, threadId, role: AiMessageRole.user },
  });
  if (!existing) throw new ChatNotFoundError("Message not found");

  const trimmed = parsed.data.content.trim();

  await prisma.$transaction(async (tx) => {
    await tx.aiMessage.update({
      where: { id: messageId },
      data: { content: trimmed },
    });

    await tx.aiMessage.deleteMany({
      where: {
        threadId,
        createdAt: { gt: existing.createdAt },
      },
    });

    const remaining = await tx.aiMessage.count({ where: { threadId } });
    await tx.aiThread.update({
      where: { id: threadId },
      data: {
        messageCount: remaining,
        summary: trimmed.slice(0, 280),
      },
    });
  });

  const updated = await prisma.aiMessage.findUnique({
    where: { id: messageId },
    select: messageSelect,
  });

  if (!updated) throw new ChatNotFoundError("Message not found");
  return toMessageRecord(updated);
}

export async function deleteMessagesAfter(
  threadId: string,
  messageId: string,
  userId: string,
) {
  await requireThreadAccess(threadId, userId, { write: true });

  const anchor = await prisma.aiMessage.findFirst({
    where: { id: messageId, threadId },
  });
  if (!anchor) throw new ChatNotFoundError("Message not found");

  await prisma.$transaction(async (tx) => {
    const deleted = await tx.aiMessage.deleteMany({
      where: {
        threadId,
        createdAt: { gt: anchor.createdAt },
      },
    });

    const remaining = await tx.aiMessage.count({ where: { threadId } });
    const last = await tx.aiMessage.findFirst({
      where: { threadId },
      orderBy: { createdAt: "desc" },
      select: { content: true, createdAt: true },
    });

    await tx.aiThread.update({
      where: { id: threadId },
      data: {
        messageCount: remaining,
        lastMessageAt: last?.createdAt ?? null,
        summary: last?.content.slice(0, 280) ?? null,
      },
    });

    return deleted.count;
  });
}

export async function getMessageForRegenerate(
  threadId: string,
  messageId: string,
  userId: string,
) {
  await requireThreadAccess(threadId, userId, { write: true });

  const message = await prisma.aiMessage.findFirst({
    where: { id: messageId, threadId },
  });
  if (!message) throw new ChatNotFoundError("Message not found");

  if (message.role === AiMessageRole.user) {
    return message;
  }

  const previousUser = await prisma.aiMessage.findFirst({
    where: {
      threadId,
      role: AiMessageRole.user,
      createdAt: { lt: message.createdAt },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!previousUser) throw new ChatValidationError("No user message to regenerate from");
  return previousUser;
}
