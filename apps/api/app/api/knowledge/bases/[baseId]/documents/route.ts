import { ragErrorResponse, missingWorkspaceResponse } from "@limbu/shared/api";
import { requireRagSession } from "@limbu/shared/session";
import { listDocuments } from "@limbu/rag";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ baseId: string }> };

export async function GET(request: Request, { params }: Params) {
  const result = await requireRagSession();
  if (result.error === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (result.error === "NO_WORKSPACE") return missingWorkspaceResponse();

  try {
    const { baseId } = await params;
    const { searchParams } = new URL(request.url);
    const data = await listDocuments(baseId, result.context, {
      cursor: searchParams.get("cursor") ?? undefined,
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
      status: searchParams.get("status") ?? undefined,
    });
    return NextResponse.json(data);
  } catch (err) {
    return ragErrorResponse(err);
  }
}
