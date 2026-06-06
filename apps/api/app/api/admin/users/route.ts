import { adminErrorResponse, requireAdminApi } from "@limbu/shared/api";
import { listUsers, paginationSchema } from "@limbu/admin";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = await requireAdminApi("platform:users:manage");
  if ("error" in auth) return auth.error;

  const url = new URL(request.url);
  const parsed = paginationSchema.safeParse({
    page: url.searchParams.get("page"),
    limit: url.searchParams.get("limit"),
    search: url.searchParams.get("search") ?? undefined,
  });

  try {
    const result = await listUsers(parsed.success ? parsed.data : {});
    return NextResponse.json(result);
  } catch (err) {
    return adminErrorResponse(err);
  }
}
