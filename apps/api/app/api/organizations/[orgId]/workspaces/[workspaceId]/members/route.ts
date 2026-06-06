import { auth } from "@/auth";
import { workspaceErrorResponse } from "@limbu/shared/api";
import { addWorkspaceMember, listWorkspaceMembers } from "@limbu/workspace";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ orgId: string; workspaceId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { workspaceId } = await params;
    const members = await listWorkspaceMembers(workspaceId, session.user.id);
    return NextResponse.json(members);
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
    const { workspaceId } = await params;
    const body = await request.json();
    await addWorkspaceMember(workspaceId, session.user.id, body);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    return workspaceErrorResponse(err);
  }
}
