import { listReviews } from "@limbu/reviews";
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
    const filter = searchParams.get("filter") ?? undefined;
    const reviews = await listReviews(result.context, filter);
    return NextResponse.json({ reviews });
  } catch (err) {
    return gmbErrorResponse(err);
  }
}
