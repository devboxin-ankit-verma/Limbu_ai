import { createPost, listPosts } from "@limbu/content";
import { writeContentAudit } from "@limbu/content";
import { gmbErrorResponse } from "@limbu/shared/api/gmb-errors";
import { missingWorkspaceResponse } from "@limbu/shared/api";
import { requireWorkspaceSession } from "@limbu/shared/session";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const result = await requireWorkspaceSession();
  if (result.error === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (result.error === "NO_WORKSPACE") return missingWorkspaceResponse();

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") ?? undefined;
    const posts = await listPosts(result.context, { status });
    return NextResponse.json({ posts });
  } catch (err) {
    return gmbErrorResponse(err);
  }
}

export async function POST(request: Request) {
  const result = await requireWorkspaceSession();
  if (result.error === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (result.error === "NO_WORKSPACE") return missingWorkspaceResponse();

  try {
    const body = await request.json();
    const post = await createPost(result.context, body);
    await writeContentAudit({
      organizationId: result.context.organizationId,
      actorId: result.context.userId,
      action: "post.created",
      resourceId: post.id,
    });
    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    return gmbErrorResponse(err);
  }
}
