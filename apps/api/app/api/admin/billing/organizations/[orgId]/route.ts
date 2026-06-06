import { billingErrorResponse } from "@limbu/shared/api";
import { auth } from "@/auth";
import {
  adminGrantCredits,
  adminSetPlan,
  getOrganizationBillingOverview,
} from "@limbu/billing";
import { PlanTier } from "@limbu/db";
import { NextResponse } from "next/server";
import { z } from "zod";

type Params = { params: Promise<{ orgId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id || !session.user.isSuperAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { orgId } = await params;
    const overview = await getOrganizationBillingOverview(orgId);
    return NextResponse.json(overview);
  } catch (err) {
    return billingErrorResponse(err);
  }
}

const grantSchema = z.object({
  action: z.literal("grant_credits"),
  amount: z.number().int().positive(),
  reason: z.string().optional(),
});

const setPlanSchema = z.object({
  action: z.literal("set_plan"),
  plan: z.nativeEnum(PlanTier),
});

export async function POST(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id || !session.user.isSuperAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { orgId } = await params;
    const body = await request.json();

    if (body.action === "grant_credits") {
      const parsed = grantSchema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
      await adminGrantCredits({
        organizationId: orgId,
        amount: parsed.data.amount,
        actorId: session.user.id,
        reason: parsed.data.reason,
      });
      return NextResponse.json({ success: true });
    }

    if (body.action === "set_plan") {
      const parsed = setPlanSchema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
      await adminSetPlan({
        organizationId: orgId,
        plan: parsed.data.plan,
        actorId: session.user.id,
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    return billingErrorResponse(err);
  }
}
