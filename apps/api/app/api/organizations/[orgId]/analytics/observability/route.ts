import { analyticsErrorResponse } from "@limbu/shared/api";
import { requireAnalyticsSession } from "@limbu/shared/session";
import { getOrganizationAnalyticsOverview, analyticsQuerySchema } from "@limbu/analytics";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ orgId: string }> };

export async function GET(request: Request, { params }: Params) {
  const { orgId } = await params;
  const sessionResult = await requireAnalyticsSession(orgId);
  if ("error" in sessionResult) {
    return NextResponse.json({ error: sessionResult.error }, { status: sessionResult.status });
  }

  const url = new URL(request.url);
  const parsed = analyticsQuerySchema.safeParse({ days: url.searchParams.get("days") ?? 30 });
  const days = parsed.success ? parsed.data.days : 30;

  try {
    const overview = await getOrganizationAnalyticsOverview(orgId, days, false);
    return NextResponse.json({ observability: overview.observability });
  } catch (err) {
    return analyticsErrorResponse(err);
  }
}
