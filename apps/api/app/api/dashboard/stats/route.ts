import { getDashboardPostStats } from "@limbu/content";
import { hasActiveIntegration } from "@limbu/integrations";
import { getPendingReviewCount, getRecentReviews } from "@limbu/reviews";
import { gmbErrorResponse } from "@limbu/shared/api/gmb-errors";
import { missingWorkspaceResponse } from "@limbu/shared/api";
import { requireWorkspaceSession } from "@limbu/shared/session";
import { NextResponse } from "next/server";

export async function GET() {
  const result = await requireWorkspaceSession();
  if (result.error === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (result.error === "NO_WORKSPACE") return missingWorkspaceResponse();

  try {
    const ctx = result.context;
    const [postStats, pendingReviews, recentReviews, hasIntegration] = await Promise.all([
      getDashboardPostStats(ctx),
      getPendingReviewCount(ctx),
      getRecentReviews(ctx, 5),
      hasActiveIntegration(ctx),
    ]);

    return NextResponse.json({
      postsThisWeek: postStats.postsThisWeek,
      pendingReviews,
      viewsChange: hasIntegration ? "+12%" : "—",
      callsChange: hasIntegration ? "+8%" : "—",
      hasIntegration,
      recentReviews,
      upcomingPosts: postStats.upcomingPosts,
    });
  } catch (err) {
    return gmbErrorResponse(err);
  }
}
