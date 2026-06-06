import { adminErrorResponse, requireAdminApi } from "@limbu/shared/api";
import { listAuditLogs, auditLogQuerySchema } from "@limbu/admin";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  const url = new URL(request.url);
  const parsed = auditLogQuerySchema.safeParse({
    page: url.searchParams.get("page"),
    limit: url.searchParams.get("limit"),
    organizationId: url.searchParams.get("organizationId") ?? undefined,
    action: url.searchParams.get("action") ?? undefined,
  });

  try {
    const result = await listAuditLogs(parsed.success ? parsed.data : {});
    return NextResponse.json(result);
  } catch (err) {
    return adminErrorResponse(err);
  }
}
