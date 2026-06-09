import { generateAndUpdatePost, writeContentAudit } from "@limbu/content";
import { gmbErrorResponse } from "@limbu/shared/api/gmb-errors";
import { missingWorkspaceResponse } from "@limbu/shared/api";
import { requireWorkspaceSession } from "@limbu/shared/session";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ postId: string }> };

export async function POST(request: Request, { params }: Params) {
  const result = await requireWorkspaceSession();
  if (result.error === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (result.error === "NO_WORKSPACE") return missingWorkspaceResponse();

  try {
    const { postId } = await params;
    const body = await request.json();
    const post = await generateAndUpdatePost(postId, result.context, body);
    await writeContentAudit({
      organizationId: result.context.organizationId,
      actorId: result.context.userId,
      action: "post.generated",
      resourceId: postId,
      metadata: { keywords: body.keywords },
    });
    return NextResponse.json({ post });
  } catch (err) {
    return gmbErrorResponse(err);
  }
}
