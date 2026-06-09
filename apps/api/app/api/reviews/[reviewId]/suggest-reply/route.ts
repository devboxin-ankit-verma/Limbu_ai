import { suggestReviewReply } from "@limbu/reviews";
import { gmbErrorResponse } from "@limbu/shared/api/gmb-errors";
import { missingWorkspaceResponse } from "@limbu/shared/api";
import { requireWorkspaceSession } from "@limbu/shared/session";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ reviewId: string }> };

export async function POST(_request: Request, { params }: Params) {
  const result = await requireWorkspaceSession();
  if (result.error === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (result.error === "NO_WORKSPACE") return missingWorkspaceResponse();

  try {
    const { reviewId } = await params;
    const suggestion = await suggestReviewReply(reviewId, result.context);
    return NextResponse.json(suggestion);
  } catch (err) {
    return gmbErrorResponse(err);
  }
}
