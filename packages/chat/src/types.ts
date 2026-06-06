import type { AiMessage, AiThread } from "@limbu/db";

export type ThreadSummary = Pick<
  AiThread,
  | "id"
  | "title"
  | "summary"
  | "messageCount"
  | "lastMessageAt"
  | "pinnedAt"
  | "archivedAt"
  | "createdAt"
  | "updatedAt"
>;

export type MessageRecord = Pick<
  AiMessage,
  "id" | "threadId" | "role" | "content" | "model" | "createdAt" | "updatedAt"
>;

export type PaginatedThreads = {
  threads: ThreadSummary[];
  nextCursor: string | null;
};

export type PaginatedMessages = {
  messages: MessageRecord[];
  nextCursor: string | null;
  hasMore: boolean;
};

export const DEFAULT_THREAD_TITLE = "New conversation";
export const MESSAGES_PAGE_SIZE = 40;
export const THREADS_PAGE_SIZE = 50;
