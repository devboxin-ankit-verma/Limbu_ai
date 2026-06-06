import { auth } from "@/auth";
import { orgErrorResponse } from "@limbu/shared/api";
import { transferOwnership } from "@limbu/org";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ orgId: string }> };

export async function POST(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orgId } = await params;
    const body = await request.json();
    const result = await transferOwnership(orgId, session.user.id, body.newOwnerMemberId);
    return NextResponse.json(result);
  } catch (err) {
    return orgErrorResponse(err);
  }
}
