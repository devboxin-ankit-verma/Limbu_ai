import { chatErrorResponse } from "@limbu/shared/api";
import { requireChatSession } from "@limbu/shared/session";
import { deleteThread, getThread, renameThread } from "@limbu/chat";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ threadId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const result = await requireChatSession();
  if (result.error === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (result.error === "NO_WORKSPACE") {
    return NextResponse.json({ error: "No workspace selected" }, { status: 400 });
  }

  try {
    const { threadId } = await params;
    const thread = await getThread(threadId, result.context.userId);
    return NextResponse.json({ thread });
  } catch (err) {
    return chatErrorResponse(err);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const result = await requireChatSession();
  if (result.error === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (result.error === "NO_WORKSPACE") {
    return NextResponse.json({ error: "No workspace selected" }, { status: 400 });
  }

  try {
    const { threadId } = await params;
    const body = await request.json();
    const thread = await renameThread(threadId, result.context.userId, body.title);
    return NextResponse.json({ thread });
  } catch (err) {
    return chatErrorResponse(err);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const result = await requireChatSession();
  if (result.error === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (result.error === "NO_WORKSPACE") {
    return NextResponse.json({ error: "No workspace selected" }, { status: 400 });
  }

  try {
    const { threadId } = await params;
    await deleteThread(threadId, result.context.userId);
    return NextResponse.json({ success: true });
  } catch (err) {
    return chatErrorResponse(err);
  }
}
