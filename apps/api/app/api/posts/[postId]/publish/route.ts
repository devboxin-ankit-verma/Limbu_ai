import { publishPostNow, writeContentAudit } from "@limbu/content";
import { gmbErrorResponse } from "@limbu/shared/api/gmb-errors";
import { missingWorkspaceResponse } from "@limbu/shared/api";
import { requireWorkspaceSession } from "@limbu/shared/session";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ postId: string }> };

export async function POST(_request: Request, { params }: Params) {
  const result = await requireWorkspaceSession();
  if (result.error === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (result.error === "NO_WORKSPACE") return missingWorkspaceResponse();

  try {
    const { checkGmbRateLimit } = await import("@limbu/shared/api/rate-limit");
    checkGmbRateLimit("publish", result.context.organizationId, 20);

    const { postId } = await params;
    const post = await publishPostNow(postId, result.context);
    await writeContentAudit({
      organizationId: result.context.organizationId,
      actorId: result.context.userId,
      action: "post.publish_requested",
      resourceId: postId,
    });
    return NextResponse.json({ post });
  } catch (err) {
    return gmbErrorResponse(err);
  }
}
