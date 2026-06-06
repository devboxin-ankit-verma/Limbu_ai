import { auth } from "@/auth";
import { workspaceErrorResponse } from "@limbu/shared/api";
import { listEligibleOrgMembers } from "@limbu/workspace";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ orgId: string; workspaceId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { workspaceId } = await params;
    const eligible = await listEligibleOrgMembers(workspaceId, session.user.id);
    return NextResponse.json({ eligible });
  } catch (err) {
    return workspaceErrorResponse(err);
  }
}
