import { chatErrorResponse } from "@limbu/shared/api";
import { requireChatSession } from "@limbu/shared/session";
import { createOrchestratorSseStream } from "@limbu/ai-core/stream";
import {
  createAssistantMessage,
  deleteMessagesAfter,
  getMessageForRegenerate,
  requireThreadAccess,
} from "@limbu/chat";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ threadId: string; messageId: string }> };

export async function POST(_request: Request, { params }: Params) {
  const result = await requireChatSession();
  if (result.error === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (result.error === "NO_WORKSPACE") {
    return NextResponse.json({ error: "No workspace selected" }, { status: 400 });
  }

  try {
    const { threadId, messageId } = await params;
    const userMessage = await getMessageForRegenerate(
      threadId,
      messageId,
      result.context.userId,
    );

    await deleteMessagesAfter(threadId, userMessage.id, result.context.userId);
    await requireThreadAccess(threadId, result.context.userId, { write: true });

    const stream = createOrchestratorSseStream(
      {
        threadId,
        userId: result.context.userId,
        workspaceId: result.context.workspaceId,
        organizationId: result.context.organizationId,
        userMessageId: userMessage.id,
      },
      async ({ content, model, tokensUsed }) => {
        const message = await createAssistantMessage(
          threadId,
          result.context.userId,
          content,
          model,
          tokensUsed,
        );
        return { messageId: message.id };
      },
    );

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    return chatErrorResponse(err);
  }
}
