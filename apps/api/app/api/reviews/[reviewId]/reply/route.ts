import { publishReviewReply } from "@limbu/reviews";
import { gmbErrorResponse } from "@limbu/shared/api/gmb-errors";
import { missingWorkspaceResponse } from "@limbu/shared/api";
import { requireWorkspaceSession } from "@limbu/shared/session";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ reviewId: string }> };

export async function POST(request: Request, { params }: Params) {
  const result = await requireWorkspaceSession();
  if (result.error === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (result.error === "NO_WORKSPACE") return missingWorkspaceResponse();

  try {
    const { reviewId } = await params;
    const body = await request.json();
    const reply = await publishReviewReply(
      reviewId,
      result.context,
      body.content,
      body.aiGenerated ?? false,
    );
    return NextResponse.json({ reply });
  } catch (err) {
    return gmbErrorResponse(err);
  }
}
