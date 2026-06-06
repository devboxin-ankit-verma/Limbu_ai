import { billingErrorResponse } from "@limbu/shared/api";
import { requireBillingSession } from "@limbu/shared/session";
import { cancelSubscription, cancelSubscriptionSchema } from "@limbu/billing";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ orgId: string }> };

export async function POST(request: Request, { params }: Params) {
  const { orgId } = await params;
  const sessionResult = await requireBillingSession(orgId, true);
  if ("error" in sessionResult) {
    return NextResponse.json({ error: sessionResult.error }, { status: sessionResult.status });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const parsed = cancelSubscriptionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const result = await cancelSubscription({
      organizationId: orgId,
      userId: sessionResult.userId,
      cancelAtPeriodEnd: parsed.data.cancelAtPeriodEnd,
    });
    return NextResponse.json(result);
  } catch (err) {
    return billingErrorResponse(err);
  }
}
