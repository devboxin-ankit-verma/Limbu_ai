import { prisma } from "@limbu/db";
import { requireThreadAccess, requireWorkspaceChatAccess } from "../access";
import { ChatNotFoundError, ChatValidationError } from "../errors";
import {
  DEFAULT_THREAD_TITLE,
  THREADS_PAGE_SIZE,
  type PaginatedThreads,
  type ThreadSummary,
} from "../types";
import {
  archiveThreadSchema,
  createThreadSchema,
  listThreadsSchema,
  pinThreadSchema,
  renameThreadSchema,
} from "../validators";

function toThreadSummary(thread: {
  id: string;
  title: string | null;
  summary: string | null;
  messageCount: number;
  lastMessageAt: Date | null;
  pinnedAt: Date | null;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): ThreadSummary {
  return {
    id: thread.id,
    title: thread.title,
    summary: thread.summary,
    messageCount: thread.messageCount,
    lastMessageAt: thread.lastMessageAt,
    pinnedAt: thread.pinnedAt,
    archivedAt: thread.archivedAt,
    createdAt: thread.createdAt,
    updatedAt: thread.updatedAt,
  };
}

export async function createThread(
  workspaceId: string,
  organizationId: string,
  userId: string,
  input?: { title?: string },
) {
  await requireWorkspaceChatAccess(workspaceId, organizationId, userId, { write: true });

  const parsed = createThreadSchema.safeParse(input ?? {});
  if (!parsed.success) {
    throw new ChatValidationError(
      "Invalid input",
      parsed.error.flatten().fieldErrors as Record<string, string[]>,
    );
  }

  const thread = await prisma.aiThread.create({
    data: {
      workspaceId,
      organizationId,
      userId,
      title: parsed.data.title?.trim() || DEFAULT_THREAD_TITLE,
    },
  });

  return toThreadSummary(thread);
}

export async function listThreads(
  workspaceId: string,
  organizationId: string,
  userId: string,
  query: {
    search?: string;
    archived?: boolean;
    cursor?: string;
    limit?: number;
  },
): Promise<PaginatedThreads> {
  await requireWorkspaceChatAccess(workspaceId, organizationId, userId);

  const parsed = listThreadsSchema.safeParse(query);
  if (!parsed.success) throw new ChatValidationError("Invalid query");

  const limit = parsed.data.limit ?? THREADS_PAGE_SIZE;
  const search = parsed.data.search?.trim();

  const threads = await prisma.aiThread.findMany({
    where: {
      workspaceId,
      organizationId,
      userId,
      archivedAt: parsed.data.archived ? { not: null } : null,
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { summary: { contains: search, mode: "insensitive" } },
              {
                messages: {
                  some: { content: { contains: search, mode: "insensitive" } },
                },
              },
            ],
          }
        : {}),
    },
    orderBy: [{ pinnedAt: "desc" }, { lastMessageAt: "desc" }, { updatedAt: "desc" }],
    take: limit + 1,
    ...(parsed.data.cursor ? { cursor: { id: parsed.data.cursor }, skip: 1 } : {}),
    select: {
      id: true,
      title: true,
      summary: true,
      messageCount: true,
      lastMessageAt: true,
      pinnedAt: true,
      archivedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const hasMore = threads.length > limit;
  const page = hasMore ? threads.slice(0, limit) : threads;

  return {
    threads: page.map(toThreadSummary),
    nextCursor: hasMore ? page[page.length - 1]?.id ?? null : null,
  };
}

export async function getThread(threadId: string, userId: string) {
  const thread = await prisma.aiThread.findFirst({
    where: { id: threadId, userId },
    select: {
      id: true,
      title: true,
      summary: true,
      messageCount: true,
      lastMessageAt: true,
      pinnedAt: true,
      archivedAt: true,
      createdAt: true,
      updatedAt: true,
      workspaceId: true,
      organizationId: true,
    },
  });

  if (!thread) throw new ChatNotFoundError();
  await requireWorkspaceChatAccess(thread.workspaceId, thread.organizationId, userId);

  return toThreadSummary(thread);
}

export async function renameThread(
  threadId: string,
  userId: string,
  title: string,
) {
  await requireThreadAccess(threadId, userId, { write: true });

  const parsed = renameThreadSchema.safeParse({ title });
  if (!parsed.success) {
    throw new ChatValidationError(
      "Invalid title",
      parsed.error.flatten().fieldErrors as Record<string, string[]>,
    );
  }

  const thread = await prisma.aiThread.update({
    where: { id: threadId },
    data: { title: parsed.data.title.trim() },
    select: {
      id: true,
      title: true,
      summary: true,
      messageCount: true,
      lastMessageAt: true,
      pinnedAt: true,
      archivedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return toThreadSummary(thread);
}

export async function deleteThread(threadId: string, userId: string) {
  await requireThreadAccess(threadId, userId, { write: true });
  await prisma.aiThread.delete({ where: { id: threadId } });
}

export async function setThreadArchived(
  threadId: string,
  userId: string,
  archived: boolean,
) {
  await requireThreadAccess(threadId, userId, { write: true });

  const parsed = archiveThreadSchema.safeParse({ archived });
  if (!parsed.success) throw new ChatValidationError("Invalid input");

  const thread = await prisma.aiThread.update({
    where: { id: threadId },
    data: { archivedAt: parsed.data.archived ? new Date() : null },
    select: {
      id: true,
      title: true,
      summary: true,
      messageCount: true,
      lastMessageAt: true,
      pinnedAt: true,
      archivedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return toThreadSummary(thread);
}

export async function setThreadPinned(
  threadId: string,
  userId: string,
  pinned: boolean,
) {
  await requireThreadAccess(threadId, userId, { write: true });

  const parsed = pinThreadSchema.safeParse({ pinned });
  if (!parsed.success) throw new ChatValidationError("Invalid input");

  const thread = await prisma.aiThread.update({
    where: { id: threadId },
    data: { pinnedAt: parsed.data.pinned ? new Date() : null },
    select: {
      id: true,
      title: true,
      summary: true,
      messageCount: true,
      lastMessageAt: true,
      pinnedAt: true,
      archivedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return toThreadSummary(thread);
}

export async function searchThreads(
  workspaceId: string,
  organizationId: string,
  userId: string,
  search: string,
) {
  return listThreads(workspaceId, organizationId, userId, {
    search,
    archived: false,
    limit: THREADS_PAGE_SIZE,
  });
}