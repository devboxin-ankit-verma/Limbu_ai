import { adminErrorResponse, requireAdminApi } from "@limbu/shared/api";
import { getUser, updateUser, suspendUser, updateUserSchema } from "@limbu/admin";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ userId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const auth = await requireAdminApi("platform:users:manage");
  if ("error" in auth) return auth.error;

  try {
    const { userId } = await params;
    const user = await getUser(userId);
    return NextResponse.json({ user });
  } catch (err) {
    return adminErrorResponse(err);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireAdminApi("platform:users:manage");
  if ("error" in auth) return auth.error;

  try {
    const { userId } = await params;
    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const user = await updateUser(userId, parsed.data, auth.userId, auth.auditOrgId);
    return NextResponse.json({ user });
  } catch (err) {
    return adminErrorResponse(err);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireAdminApi("platform:users:manage");
  if ("error" in auth) return auth.error;

  try {
    const { userId } = await params;
    const result = await suspendUser(userId, auth.userId, auth.auditOrgId);
    return NextResponse.json(result);
  } catch (err) {
    return adminErrorResponse(err);
  }
}
