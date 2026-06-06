import { auth } from "@/auth";
import { orgErrorResponse } from "@limbu/shared/api";
import { inviteMember, listOrganizationMembers } from "@limbu/org";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ orgId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orgId } = await params;
    const members = await listOrganizationMembers(orgId, session.user.id);
    return NextResponse.json(members);
  } catch (err) {
    return orgErrorResponse(err);
  }
}

export async function POST(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orgId } = await params;
    const body = await request.json();
    const invitation = await inviteMember(orgId, session.user.id, body);
    return NextResponse.json({ invitation }, { status: 201 });
  } catch (err) {
    return orgErrorResponse(err);
  }
}
