import { ragErrorResponse, missingWorkspaceResponse } from "@limbu/shared/api";
import { requireRagSession } from "@limbu/shared/session";
import { reindexDocument } from "@limbu/rag";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ documentId: string }> };

export async function POST(_request: Request, { params }: Params) {
  const result = await requireRagSession();
  if (result.error === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (result.error === "NO_WORKSPACE") return missingWorkspaceResponse();

  try {
    const { documentId } = await params;
    const document = await reindexDocument(documentId, result.context);
    return NextResponse.json({ document });
  } catch (err) {
    return ragErrorResponse(err);
  }
}
