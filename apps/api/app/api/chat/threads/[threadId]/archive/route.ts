import { chatErrorResponse } from "@limbu/shared/api";
import { requireChatSession } from "@limbu/shared/session";
import { setThreadArchived } from "@limbu/chat";
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
    const body = await request.json();
    const thread = await setThreadArchived(
      threadId,
      result.context.userId,
      Boolean(body.archived),
    );
    return NextResponse.json({ thread });
  } catch (err) {
    return chatErrorResponse(err);
  }
}
