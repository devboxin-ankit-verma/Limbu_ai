import { auth } from "@/auth";
import { orgErrorResponse } from "@limbu/shared/api";
import {
  reactivateMember,
  removeMember,
  suspendMember,
  updateMemberRole,
} from "@limbu/org";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ orgId: string; memberId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orgId, memberId } = await params;
    const body = await request.json();

    if (body.action === "suspend") {
      await suspendMember(orgId, session.user.id, memberId);
      return NextResponse.json({ success: true });
    }

    if (body.action === "reactivate") {
      await reactivateMember(orgId, session.user.id, memberId);
      return NextResponse.json({ success: true });
    }

    if (body.role) {
      const member = await updateMemberRole(orgId, session.user.id, memberId, body.role);
      return NextResponse.json({ member });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
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
    const { orgId, memberId } = await params;
    await removeMember(orgId, session.user.id, memberId);
    return NextResponse.json({ success: true });
  } catch (err) {
    return orgErrorResponse(err);
  }
}
