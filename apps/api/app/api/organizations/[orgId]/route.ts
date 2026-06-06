import { auth } from "@/auth";
import { orgErrorResponse } from "@limbu/shared/api";
import {
  deleteOrganization,
  getOrganizationProfile,
  updateOrganization,
} from "@limbu/org";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ orgId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orgId } = await params;
    const organization = await getOrganizationProfile(orgId, session.user.id);
    return NextResponse.json({ organization });
  } catch (err) {
    return orgErrorResponse(err);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orgId } = await params;
    const body = await request.json();
    const organization = await updateOrganization(orgId, session.user.id, body);
    return NextResponse.json({ organization });
  } catch (err) {
    return orgErrorResponse(err);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orgId } = await params;
    await deleteOrganization(orgId, session.user.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return orgErrorResponse(err);
  }
}
