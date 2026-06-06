import { billingErrorResponse } from "@limbu/shared/api";
import { auth } from "@/auth";
import { updatePlanEntitlement, updateEntitlementSchema } from "@limbu/billing";
import { PlanTier } from "@limbu/db";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ planTier: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id || !session.user.isSuperAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { planTier } = await params;
  if (!Object.values(PlanTier).includes(planTier as PlanTier)) {
    return NextResponse.json({ error: "Invalid plan tier" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const parsed = updateEntitlementSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const auditOrgId = session.user.organizationId ?? undefined;
    if (!auditOrgId) {
      return NextResponse.json({ error: "No organization context for audit" }, { status: 400 });
    }

    const entitlement = await updatePlanEntitlement(
      planTier as PlanTier,
      parsed.data,
      session.user.id,
      auditOrgId,
    );
    return NextResponse.json({ entitlement });
  } catch (err) {
    return billingErrorResponse(err);
  }
}
