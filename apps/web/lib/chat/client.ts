import type { MessageRecord, PaginatedMessages, PaginatedThreads, ThreadSummary } from "@limbu/chat";
import type { StreamEvent } from "@limbu/chat/stream";

export async function fetchThreads(params?: {
  search?: string;
  archived?: boolean;
  cursor?: string;
}): Promise<PaginatedThreads> {
  const qs = new URLSearchParams();
  if (params?.search) qs.set("search", params.search);
  if (params?.archived) qs.set("archived", "true");
  if (params?.cursor) qs.set("cursor", params.cursor);

  const res = await fetch(`/api/chat/threads?${qs.toString()}`);
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function searchThreads(q: string): Promise<PaginatedThreads> {
  const res = await fetch(`/api/chat/threads/search?q=${encodeURIComponent(q)}`);
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function createThreadApi(title?: string): Promise<ThreadSummary> {
  const res = await fetch("/api/chat/threads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(title ? { title } : {}),
  });
  if (!res.ok) throw new Error(await readError(res));
  const data = await res.json();
  return data.thread;
}

export async function renameThreadApi(threadId: string, title: string): Promise<ThreadSummary> {
  const res = await fetch(`/api/chat/threads/${threadId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error(await readError(res));
  const data = await res.json();
  return data.thread;
}

export async function deleteThreadApi(threadId: string) {
  const res = await fetch(`/api/chat/threads/${threadId}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await readError(res));
}

export async function archiveThreadApi(threadId: string, archived: boolean): Promise<ThreadSummary> {
  const res = await fetch(`/api/chat/threads/${threadId}/archive`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ archived }),
  });
  if (!res.ok) throw new Error(await readError(res));
  const data = await res.json();
  return data.thread;
}

export async function pinThreadApi(threadId: string, pinned: boolean): Promise<ThreadSummary> {
  const res = await fetch(`/api/chat/threads/${threadId}/pin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pinned }),
  });
  if (!res.ok) throw new Error(await readError(res));
  const data = await res.json();
  return data.thread;
}

export async function fetchMessages(
  threadId: string,
  cursor?: string,
): Promise<PaginatedMessages> {
  const qs = new URLSearchParams();
  if (cursor) qs.set("cursor", cursor);
  const res = await fetch(`/api/chat/threads/${threadId}/messages?${qs.toString()}`);
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function sendMessageApi(
  threadId: string,
  content: string,
): Promise<MessageRecord> {
  const res = await fetch(`/api/chat/threads/${threadId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error(await readError(res));
  const data = await res.json();
  return data.message;
}

export async function editMessageApi(
  threadId: string,
  messageId: string,
  content: string,
): Promise<MessageRecord> {
  const res = await fetch(`/api/chat/threads/${threadId}/messages/${messageId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error(await readError(res));
  const data = await res.json();
  return data.message;
}

export async function consumeSseStream(
  url: string,
  init: RequestInit,
  handlers: {
    onDelta: (content: string) => void;
    onDone: (messageId: string) => void;
    onError: (message: string) => void;
  },
) {
  const res = await fetch(url, init);
  if (!res.ok || !res.body) throw new Error(await readError(res));

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";

    for (const part of parts) {
      const line = part.trim();
      if (!line.startsWith("data: ")) continue;
      const event = JSON.parse(line.slice(6)) as StreamEvent;
      if (event.type === "delta") handlers.onDelta(event.content);
      if (event.type === "done") handlers.onDone(event.messageId);
      if (event.type === "error") handlers.onError(event.message);
    }
  }
}

export async function streamAssistantReply(threadId: string, userMessageId: string) {
  return consumeSseStream(
    `/api/chat/threads/${threadId}/stream`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userMessageId }),
    },
    { onDelta: () => {}, onDone: () => {}, onError: () => {} },
  );
}

async function readError(res: Response) {
  try {
    const data = await res.json();
    return data.error ?? res.statusText;
  } catch {
    return res.statusText;
  }
}
