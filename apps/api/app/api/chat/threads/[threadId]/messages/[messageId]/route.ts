import { chatErrorResponse } from "@limbu/shared/api";
import { requireChatSession } from "@limbu/shared/session";
import { editUserMessage } from "@limbu/chat";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ threadId: string; messageId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const result = await requireChatSession();
  if (result.error === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (result.error === "NO_WORKSPACE") {
    return NextResponse.json({ error: "No workspace selected" }, { status: 400 });
  }

  try {
    const { threadId, messageId } = await params;
    const body = await request.json();
    const message = await editUserMessage(
      threadId,
      messageId,
      result.context.userId,
      body.content,
    );
    return NextResponse.json({ message });
  } catch (err) {
    return chatErrorResponse(err);
  }
}
