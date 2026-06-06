import { chatErrorResponse, chatMissingWorkspaceResponse } from "@limbu/shared/api";
import { requireChatSession } from "@limbu/shared/session";
import { createThread, listThreads } from "@limbu/chat";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const result = await requireChatSession();
  if (result.error === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (result.error === "NO_WORKSPACE") return chatMissingWorkspaceResponse();

  const { searchParams } = new URL(request.url);

  try {
    const data = await listThreads(
      result.context.workspaceId,
      result.context.organizationId,
      result.context.userId,
      {
        search: searchParams.get("search") ?? undefined,
        archived: searchParams.get("archived") === "true",
        cursor: searchParams.get("cursor") ?? undefined,
        limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
      },
    );
    return NextResponse.json(data);
  } catch (err) {
    return chatErrorResponse(err);
  }
}

export async function POST(request: Request) {
  const result = await requireChatSession();
  if (result.error === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (result.error === "NO_WORKSPACE") return chatMissingWorkspaceResponse();

  try {
    const body = await request.json().catch(() => ({}));
    const thread = await createThread(
      result.context.workspaceId,
      result.context.organizationId,
      result.context.userId,
      body,
    );
    return NextResponse.json({ thread }, { status: 201 });
  } catch (err) {
    return chatErrorResponse(err);
  }
}
