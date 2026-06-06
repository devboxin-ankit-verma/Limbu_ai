import { billingErrorResponse } from "@limbu/shared/api";
import { requireBillingSession } from "@limbu/shared/session";
import { changeSubscriptionPlan, changePlanSchema } from "@limbu/billing";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ orgId: string }> };

export async function POST(request: Request, { params }: Params) {
  const { orgId } = await params;
  const sessionResult = await requireBillingSession(orgId, true);
  if ("error" in sessionResult) {
    return NextResponse.json({ error: sessionResult.error }, { status: sessionResult.status });
  }

  try {
    const body = await request.json();
    const parsed = changePlanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const result = await changeSubscriptionPlan({
      organizationId: orgId,
      userId: sessionResult.userId,
      plan: parsed.data.plan,
      interval: parsed.data.interval,
    });
    return NextResponse.json(result);
  } catch (err) {
    return billingErrorResponse(err);
  }
}
