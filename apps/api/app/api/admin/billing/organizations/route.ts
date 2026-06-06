import { billingErrorResponse } from "@limbu/shared/api";
import { auth } from "@/auth";
import { listOrganizationsBilling } from "@limbu/billing";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.isSuperAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page") ?? "1");
  const limit = Number(url.searchParams.get("limit") ?? "20");

  try {
    const result = await listOrganizationsBilling(page, limit);
    return NextResponse.json(result);
  } catch (err) {
    return billingErrorResponse(err);
  }
}
