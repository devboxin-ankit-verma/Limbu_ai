import { analyticsErrorResponse } from "@limbu/shared/api";
import { requireAnalyticsSession } from "@limbu/shared/session";
import { auth } from "@/auth";
import { hasPermission } from "@limbu/auth/rbac";
import { getOrgBusinessAnalytics, analyticsQuerySchema } from "@limbu/analytics";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ orgId: string }> };

export async function GET(request: Request, { params }: Params) {
  const { orgId } = await params;
  const sessionResult = await requireAnalyticsSession(orgId);
  if ("error" in sessionResult) {
    return NextResponse.json({ error: sessionResult.error }, { status: sessionResult.status });
  }

  if (
    !hasPermission("org:billing:manage", {
      isSuperAdmin: sessionResult.isSuperAdmin,
      orgRole: sessionResult.orgRole,
      workspaceRole: null,
    })
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(request.url);
  const parsed = analyticsQuerySchema.safeParse({ days: url.searchParams.get("days") ?? 30 });
  const days = parsed.success ? parsed.data.days : 30;

  try {
    const business = await getOrgBusinessAnalytics(orgId, days);
    return NextResponse.json({ business });
  } catch (err) {
    return analyticsErrorResponse(err);
  }
}
