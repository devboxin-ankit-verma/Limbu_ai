import { analyticsErrorResponse } from "@limbu/shared/api";
import { requireAnalyticsSession } from "@limbu/shared/session";
import { auth } from "@/auth";
import { hasPermission } from "@limbu/auth/rbac";
import {
  getOrganizationAnalyticsOverview,
  trackProductEvent,
  trackEventSchema,
  analyticsQuerySchema,
} from "@limbu/analytics";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ orgId: string }> };

export async function GET(request: Request, { params }: Params) {
  const { orgId } = await params;
  const sessionResult = await requireAnalyticsSession(orgId);
  if ("error" in sessionResult) {
    return NextResponse.json({ error: sessionResult.error }, { status: sessionResult.status });
  }

  const url = new URL(request.url);
  const parsed = analyticsQuerySchema.safeParse({
    days: url.searchParams.get("days") ?? 30,
  });
  const days = parsed.success ? parsed.data.days : 30;

  const includeBusiness = hasPermission("org:billing:manage", {
    isSuperAdmin: sessionResult.isSuperAdmin,
    orgRole: sessionResult.orgRole,
    workspaceRole: null,
  });

  try {
    const overview = await getOrganizationAnalyticsOverview(orgId, days, includeBusiness);
    return NextResponse.json({ overview });
  } catch (err) {
    return analyticsErrorResponse(err);
  }
}

export async function POST(request: Request, { params }: Params) {
  const { orgId } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = trackEventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    await trackProductEvent({
      eventName: parsed.data.eventName,
      userId: session.user.id,
      organizationId: orgId,
      workspaceId: parsed.data.workspaceId ?? session.user.workspaceId ?? undefined,
      properties: parsed.data.properties,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return analyticsErrorResponse(err);
  }
}
