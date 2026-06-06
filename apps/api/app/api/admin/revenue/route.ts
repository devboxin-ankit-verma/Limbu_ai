import { adminErrorResponse, requireAdminApi } from "@limbu/shared/api";
import { getRevenueDashboard } from "@limbu/admin";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  const days = Number(new URL(request.url).searchParams.get("days") ?? "30");

  try {
    const revenue = await getRevenueDashboard(days);
    return NextResponse.json({ revenue });
  } catch (err) {
    return adminErrorResponse(err);
  }
}
