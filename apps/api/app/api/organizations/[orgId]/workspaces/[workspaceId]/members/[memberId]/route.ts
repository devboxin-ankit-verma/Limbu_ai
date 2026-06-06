import { auth } from "@/auth";
import { workspaceErrorResponse } from "@limbu/shared/api";
import {
  removeWorkspaceMember,
  updateWorkspaceMemberRole,
} from "@limbu/workspace";
import { NextResponse } from "next/server";

type Params = {
  params: Promise<{ orgId: string; workspaceId: string; memberId: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { workspaceId, memberId } = await params;
    const body = await request.json();
    await updateWorkspaceMemberRole(
      workspaceId,
      session.user.id,
      memberId,
      body.role,
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    return workspaceErrorResponse(err);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { workspaceId, memberId } = await params;
    await removeWorkspaceMember(workspaceId, session.user.id, memberId);
    return NextResponse.json({ success: true });
  } catch (err) {
    return workspaceErrorResponse(err);
  }
}
