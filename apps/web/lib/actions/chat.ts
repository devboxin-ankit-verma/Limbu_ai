"use server";

import {
  createThread,
  deleteThread,
  isChatError,
  listMessages,
  listThreads,
  renameThread,
  setThreadArchived,
  setThreadPinned,
} from "@limbu/chat";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/session";

export type ChatActionResult = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  threadId?: string;
};

function handleChatError(err: unknown): ChatActionResult {
  if (isChatError(err)) {
    return {
      error: err.message,
      fieldErrors: "fieldErrors" in err ? (err.fieldErrors as Record<string, string[]>) : undefined,
    };
  }
  throw err;
}

async function getContext() {
  const session = await requireAuth();
  if (!session.user.workspaceId || !session.user.organizationId) {
    throw new Error("NO_WORKSPACE");
  }
  return {
    userId: session.user.id,
    workspaceId: session.user.workspaceId,
    organizationId: session.user.organizationId,
  };
}

export async function createConversationAction(): Promise<ChatActionResult> {
  try {
    const ctx = await getContext();
    const thread = await createThread(ctx.workspaceId, ctx.organizationId, ctx.userId);
    revalidatePath("/chat");
    redirect(`/chat/${thread.id}`);
  } catch (err) {
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    if (err instanceof Error && err.message === "NO_WORKSPACE") {
      return { error: "Select a workspace before starting a chat" };
    }
    return handleChatError(err);
  }
}

export async function renameConversationAction(
  threadId: string,
  title: string,
): Promise<ChatActionResult> {
  try {
    const ctx = await getContext();
    await renameThread(threadId, ctx.userId, title);
    revalidatePath("/chat");
    revalidatePath(`/chat/${threadId}`);
    return { success: true, threadId };
  } catch (err) {
    return handleChatError(err);
  }
}

export async function deleteConversationAction(threadId: string): Promise<ChatActionResult> {
  try {
    const ctx = await getContext();
    await deleteThread(threadId, ctx.userId);
    revalidatePath("/chat");
    redirect("/chat");
  } catch (err) {
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    return handleChatError(err);
  }
}

export async function archiveConversationAction(
  threadId: string,
  archived: boolean,
): Promise<ChatActionResult> {
  try {
    const ctx = await getContext();
    await setThreadArchived(threadId, ctx.userId, archived);
    revalidatePath("/chat");
    return { success: true, threadId };
  } catch (err) {
    return handleChatError(err);
  }
}

export async function pinConversationAction(
  threadId: string,
  pinned: boolean,
): Promise<ChatActionResult> {
  try {
    const ctx = await getContext();
    await setThreadPinned(threadId, ctx.userId, pinned);
    revalidatePath("/chat");
    return { success: true, threadId };
  } catch (err) {
    return handleChatError(err);
  }
}

export async function loadThreadsAction(options?: {
  search?: string;
  archived?: boolean;
  cursor?: string;
}) {
  const ctx = await getContext();
  return listThreads(ctx.workspaceId, ctx.organizationId, ctx.userId, options ?? {});
}

export async function loadMessagesAction(
  threadId: string,
  cursor?: string,
) {
  const ctx = await getContext();
  return listMessages(threadId, ctx.userId, { cursor });
}
