import { analyticsErrorResponse } from "@limbu/shared/api";
import { auth } from "@/auth";
import { getPlatformAnalyticsOverview, analyticsQuerySchema } from "@limbu/analytics";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.isSuperAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(request.url);
  const parsed = analyticsQuerySchema.safeParse({ days: url.searchParams.get("days") ?? 30 });
  const days = parsed.success ? parsed.data.days : 30;

  try {
    const overview = await getPlatformAnalyticsOverview(days);
    return NextResponse.json({ overview });
  } catch (err) {
    return analyticsErrorResponse(err);
  }
}
