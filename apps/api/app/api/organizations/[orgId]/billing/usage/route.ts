import { billingErrorResponse } from "@limbu/shared/api";
import { requireBillingSession } from "@limbu/shared/session";
import { getUsageSummary } from "@limbu/billing";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ orgId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { orgId } = await params;
  const sessionResult = await requireBillingSession(orgId);
  if ("error" in sessionResult) {
    return NextResponse.json({ error: sessionResult.error }, { status: sessionResult.status });
  }

  try {
    const usage = await getUsageSummary(orgId);
    return NextResponse.json({ usage });
  } catch (err) {
    return billingErrorResponse(err);
  }
}
