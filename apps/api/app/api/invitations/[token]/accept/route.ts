import { auth } from "@/auth";
import { orgErrorResponse } from "@limbu/shared/api";
import { acceptInvitation } from "@limbu/org";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ token: string }> };

export async function POST(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { token } = await params;
    const result = await acceptInvitation(token, session.user.id, session.user.email);
    return NextResponse.json(result);
  } catch (err) {
    return orgErrorResponse(err);
  }
}
