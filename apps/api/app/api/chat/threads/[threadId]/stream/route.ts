import { chatErrorResponse } from "@limbu/shared/api";
import { requireChatSession } from "@limbu/shared/session";
import { createOrchestratorSseStream } from "@limbu/ai-core/stream";
import { createAssistantMessage, requireThreadAccess } from "@limbu/chat";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ threadId: string }> };

export async function POST(request: Request, { params }: Params) {
  const result = await requireChatSession();
  if (result.error === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (result.error === "NO_WORKSPACE") {
    return NextResponse.json({ error: "No workspace selected" }, { status: 400 });
  }

  try {
    const { threadId } = await params;
    const body = await request.json().catch(() => ({}));
    const userMessageId = body.userMessageId as string | undefined;

    if (!userMessageId) {
      return NextResponse.json({ error: "userMessageId is required" }, { status: 400 });
    }

    await requireThreadAccess(threadId, result.context!.userId, { write: true });

    const stream = createOrchestratorSseStream(
      {
        threadId,
        userId: result.context!.userId,
        workspaceId: result.context!.workspaceId,
        organizationId: result.context!.organizationId,
        userMessageId,
      },
      async ({ content, model, tokensUsed }) => {
        const message = await createAssistantMessage(
          threadId,
          result.context!.userId,
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
