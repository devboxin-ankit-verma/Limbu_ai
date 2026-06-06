import { billingErrorResponse } from "@limbu/shared/api";
import { requireBillingSession } from "@limbu/shared/session";
import { createCheckoutSession, checkoutSchema } from "@limbu/billing";
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
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const result = await createCheckoutSession({
      organizationId: orgId,
      userId: sessionResult.userId,
      email: sessionResult.email ?? "",
      plan: parsed.data.plan,
      interval: parsed.data.interval,
      couponCode: parsed.data.couponCode,
    });

    return NextResponse.json(result);
  } catch (err) {
    return billingErrorResponse(err);
  }
}
