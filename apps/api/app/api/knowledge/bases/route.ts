import { ragErrorResponse, missingWorkspaceResponse } from "@limbu/shared/api";
import { requireRagSession } from "@limbu/shared/session";
import {
  createKnowledgeBase,
  getOrCreateDefaultKnowledgeBase,
  listKnowledgeBases,
} from "@limbu/rag";
import { KnowledgeBaseScope } from "@limbu/db";
import { NextResponse } from "next/server";

export async function GET() {
  const result = await requireRagSession();
  if (result.error === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (result.error === "NO_WORKSPACE") return missingWorkspaceResponse();

  try {
    await Promise.all([
      getOrCreateDefaultKnowledgeBase(result.context, KnowledgeBaseScope.workspace),
      getOrCreateDefaultKnowledgeBase(result.context, KnowledgeBaseScope.organization),
      getOrCreateDefaultKnowledgeBase(result.context, KnowledgeBaseScope.personal),
    ]);

    const bases = await listKnowledgeBases(result.context);
    return NextResponse.json({ bases });
  } catch (err) {
    return ragErrorResponse(err);
  }
}

export async function POST(request: Request) {
  const result = await requireRagSession();
  if (result.error === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (result.error === "NO_WORKSPACE") return missingWorkspaceResponse();

  try {
    const body = await request.json();
    const base = await createKnowledgeBase(result.context, body);
    return NextResponse.json({ base }, { status: 201 });
  } catch (err) {
    return ragErrorResponse(err);
  }
}
