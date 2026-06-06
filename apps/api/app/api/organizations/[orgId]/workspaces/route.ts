import { auth } from "@/auth";
import { workspaceErrorResponse } from "@limbu/shared/api";
import { createWorkspace, listWorkspacesForUser } from "@limbu/workspace";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ orgId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orgId } = await params;
    const workspaces = await listWorkspacesForUser(orgId, session.user.id);
    return NextResponse.json({ workspaces });
  } catch (err) {
    return workspaceErrorResponse(err);
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
    const workspace = await createWorkspace(orgId, session.user.id, body);
    return NextResponse.json({ workspace }, { status: 201 });
  } catch (err) {
    return workspaceErrorResponse(err);
  }
}
