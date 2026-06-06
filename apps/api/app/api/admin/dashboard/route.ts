import { adminErrorResponse, requireAdminApi } from "@limbu/shared/api";
import { getAdminDashboardSummary } from "@limbu/admin";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  try {
    const summary = await getAdminDashboardSummary();
    return NextResponse.json({ summary });
  } catch (err) {
    return adminErrorResponse(err);
  }
}
