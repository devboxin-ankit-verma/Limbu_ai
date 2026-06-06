import { adminErrorResponse, requireAdminApi } from "@limbu/shared/api";
import { getSystemHealth } from "@limbu/admin";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  try {
    const health = await getSystemHealth();
    return NextResponse.json({ health });
  } catch (err) {
    return adminErrorResponse(err);
  }
}
