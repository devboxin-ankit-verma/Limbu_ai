import { auth } from "@/auth";
import { workspaceErrorResponse } from "@limbu/shared/api";
import { suspendWorkspaceMember } from "@limbu/workspace";
import { NextResponse } from "next/server";

type Params = {
  params: Promise<{ orgId: string; workspaceId: string; memberId: string }>;
};

export async function POST(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { workspaceId, memberId } = await params;
    await suspendWorkspaceMember(workspaceId, session.user.id, memberId);
    return NextResponse.json({ success: true });
  } catch (err) {
    return workspaceErrorResponse(err);
  }
}
