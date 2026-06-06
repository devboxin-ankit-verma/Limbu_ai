import { billingErrorResponse } from "@limbu/shared/api";
import { requireBillingSession } from "@limbu/shared/session";
import { createCustomerPortalSession } from "@limbu/billing";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ orgId: string }> };

export async function POST(_request: Request, { params }: Params) {
  const { orgId } = await params;
  const sessionResult = await requireBillingSession(orgId, true);
  if ("error" in sessionResult) {
    return NextResponse.json({ error: sessionResult.error }, { status: sessionResult.status });
  }

  try {
    const result = await createCustomerPortalSession({
      organizationId: orgId,
      userId: sessionResult.userId,
      email: sessionResult.email ?? "",
    });
    return NextResponse.json(result);
  } catch (err) {
    return billingErrorResponse(err);
  }
}
