import { chatErrorResponse } from "@limbu/shared/api";
import { requireChatSession } from "@limbu/shared/session";
import { createUserMessage, listMessages } from "@limbu/chat";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ threadId: string }> };

export async function GET(request: Request, { params }: Params) {
  const result = await requireChatSession();
  if (result.error === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (result.error === "NO_WORKSPACE") {
    return NextResponse.json({ error: "No workspace selected" }, { status: 400 });
  }

  try {
    const { threadId } = await params;
    const { searchParams } = new URL(request.url);
    const data = await listMessages(threadId, result.context.userId, {
      cursor: searchParams.get("cursor") ?? undefined,
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
    });
    return NextResponse.json(data);
  } catch (err) {
    return chatErrorResponse(err);
  }
}

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
    const body = await request.json();
    const message = await createUserMessage(threadId, result.context.userId, body.content);
    return NextResponse.json({ message }, { status: 201 });
  } catch (err) {
    return chatErrorResponse(err);
  }
}
