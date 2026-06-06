import { ragErrorResponse, missingWorkspaceResponse } from "@limbu/shared/api";
import { requireRagSession } from "@limbu/shared/session";
import { retrieveKnowledgeContext, searchKnowledgeSchema } from "@limbu/rag";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const result = await requireRagSession();
  if (result.error === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (result.error === "NO_WORKSPACE") return missingWorkspaceResponse();

  try {
    const body = await request.json();
    const parsed = searchKnowledgeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid search request" }, { status: 400 });
    }

    const retrieval = await retrieveKnowledgeContext({
      query: parsed.data.query,
      organizationId: result.context.organizationId,
      workspaceId: result.context.workspaceId,
      userId: result.context.userId,
      knowledgeBaseIds: parsed.data.knowledgeBaseIds,
      scopes: parsed.data.scopes,
      topK: parsed.data.topK,
      hybrid: parsed.data.hybrid,
    });

    return NextResponse.json(retrieval);
  } catch (err) {
    return ragErrorResponse(err);
  }
}
