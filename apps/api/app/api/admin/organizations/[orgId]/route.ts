import { adminErrorResponse, requireAdminApi } from "@limbu/shared/api";
import {
  getOrganization,
  updateOrganization,
  suspendOrganization,
  updateOrganizationSchema,
} from "@limbu/admin";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ orgId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const auth = await requireAdminApi("platform:organizations:read");
  if ("error" in auth) return auth.error;

  try {
    const { orgId } = await params;
    const organization = await getOrganization(orgId);
    return NextResponse.json({ organization });
  } catch (err) {
    return adminErrorResponse(err);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireAdminApi("platform:organizations:manage");
  if ("error" in auth) return auth.error;

  try {
    const { orgId } = await params;
    const body = await request.json();
    const parsed = updateOrganizationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const organization = await updateOrganization(orgId, parsed.data, auth.userId);
    return NextResponse.json({ organization });
  } catch (err) {
    return adminErrorResponse(err);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireAdminApi("platform:organizations:manage");
  if ("error" in auth) return auth.error;

  try {
    const { orgId } = await params;
    const organization = await suspendOrganization(orgId, auth.userId);
    return NextResponse.json({ organization });
  } catch (err) {
    return adminErrorResponse(err);
  }
}
