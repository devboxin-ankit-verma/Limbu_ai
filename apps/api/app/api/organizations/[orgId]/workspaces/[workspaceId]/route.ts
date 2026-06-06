import { auth } from "@/auth";
import { workspaceErrorResponse } from "@limbu/shared/api";
import {
  deleteWorkspace,
  getWorkspaceProfile,
  updateWorkspace,
} from "@limbu/workspace";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ orgId: string; workspaceId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orgId, workspaceId } = await params;
    const workspace = await getWorkspaceProfile(workspaceId, session.user.id);
    if (workspace.organizationId !== orgId) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }
    return NextResponse.json({ workspace });
  } catch (err) {
    return workspaceErrorResponse(err);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orgId, workspaceId } = await params;
    const body = await request.json();
    const workspace = await updateWorkspace(workspaceId, session.user.id, body);
    if (workspace.organizationId !== orgId) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }
    return NextResponse.json({ workspace });
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
    const { workspaceId } = await params;
    await deleteWorkspace(workspaceId, session.user.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return workspaceErrorResponse(err);
  }
}
