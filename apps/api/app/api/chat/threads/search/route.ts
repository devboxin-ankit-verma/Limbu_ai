import { chatErrorResponse, chatMissingWorkspaceResponse } from "@limbu/shared/api";
import { requireChatSession } from "@limbu/shared/session";
import { searchThreads } from "@limbu/chat";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const result = await requireChatSession();
  if (result.error === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (result.error === "NO_WORKSPACE") return chatMissingWorkspaceResponse();

  const q = new URL(request.url).searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json({ threads: [], nextCursor: null });
  }

  try {
    const data = await searchThreads(
      result.context.workspaceId,
      result.context.organizationId,
      result.context.userId,
      q,
    );
    return NextResponse.json(data);
  } catch (err) {
    return chatErrorResponse(err);
  }
}
