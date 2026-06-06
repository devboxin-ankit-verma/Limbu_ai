import { adminErrorResponse, requireAdminApi } from "@limbu/shared/api";
import { adminUpdateSubscriptionPlan, setSubscriptionPlanSchema } from "@limbu/admin";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ orgId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireAdminApi("platform:organizations:manage");
  if ("error" in auth) return auth.error;

  try {
    const { orgId } = await params;
    const body = await request.json();
    const parsed = setSubscriptionPlanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const result = await adminUpdateSubscriptionPlan({
      organizationId: orgId,
      plan: parsed.data.plan,
      actorId: auth.userId,
    });
    return NextResponse.json(result);
  } catch (err) {
    return adminErrorResponse(err);
  }
}
