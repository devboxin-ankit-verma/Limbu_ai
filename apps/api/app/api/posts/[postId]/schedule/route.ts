import { schedulePost, writeContentAudit } from "@limbu/content";
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
    const post = await schedulePost(postId, result.context, new Date(body.scheduledAt));
    await writeContentAudit({
      organizationId: result.context.organizationId,
      actorId: result.context.userId,
      action: "post.scheduled",
      resourceId: postId,
      metadata: { scheduledAt: body.scheduledAt },
    });
    return NextResponse.json({ post });
  } catch (err) {
    return gmbErrorResponse(err);
  }
}
