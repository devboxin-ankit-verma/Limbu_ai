import { ragErrorResponse, missingWorkspaceResponse } from "@limbu/shared/api";
import { requireRagSession } from "@limbu/shared/session";
import { deleteKnowledgeBase, getKnowledgeBase, updateKnowledgeBase } from "@limbu/rag";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ baseId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const result = await requireRagSession();
  if (result.error === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (result.error === "NO_WORKSPACE") return missingWorkspaceResponse();

  try {
    const { baseId } = await params;
    const base = await getKnowledgeBase(baseId, result.context);
    return NextResponse.json({ base });
  } catch (err) {
    return ragErrorResponse(err);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const result = await requireRagSession();
  if (result.error === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (result.error === "NO_WORKSPACE") return missingWorkspaceResponse();

  try {
    const { baseId } = await params;
    const body = await request.json();
    const base = await updateKnowledgeBase(baseId, result.context, body);
    return NextResponse.json({ base });
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
    const { baseId } = await params;
    const deleted = await deleteKnowledgeBase(baseId, result.context);
    return NextResponse.json(deleted);
  } catch (err) {
    return ragErrorResponse(err);
  }
}
