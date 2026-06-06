import { ragErrorResponse, missingWorkspaceResponse } from "@limbu/shared/api";
import { requireRagSession } from "@limbu/shared/session";
import { deleteDocument, getDocument } from "@limbu/rag";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ documentId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const result = await requireRagSession();
  if (result.error === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (result.error === "NO_WORKSPACE") return missingWorkspaceResponse();

  try {
    const { documentId } = await params;
    const document = await getDocument(documentId, result.context);
    return NextResponse.json({ document });
  } catch (err) {
    return ragErrorResponse(err);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const result = await requireRagSession();
  if (result.error === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (result.error === "NO_WORKSPACE") return missingWorkspaceResponse();

  try {
    const { documentId } = await params;
    const deleted = await deleteDocument(documentId, result.context);
    return NextResponse.json(deleted);
  } catch (err) {
    return ragErrorResponse(err);
  }
}
