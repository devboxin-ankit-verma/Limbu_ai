import { billingErrorResponse } from "@limbu/shared/api";
import { auth } from "@/auth";
import { listPlanEntitlements } from "@limbu/billing";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || !session.user.isSuperAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const entitlements = await listPlanEntitlements();
    return NextResponse.json({ entitlements });
  } catch (err) {
    return billingErrorResponse(err);
  }
}
