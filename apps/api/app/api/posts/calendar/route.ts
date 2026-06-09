import { getCalendarPosts } from "@limbu/content";
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
    const from = searchParams.get("from") ?? new Date().toISOString();
    const to =
      searchParams.get("to") ??
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const posts = await getCalendarPosts(result.context, new Date(from), new Date(to));
    return NextResponse.json({ posts });
  } catch (err) {
    return gmbErrorResponse(err);
  }
}
