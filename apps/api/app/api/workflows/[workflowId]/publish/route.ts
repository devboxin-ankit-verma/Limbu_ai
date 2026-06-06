import { workflowErrorResponse, missingWorkspaceResponse } from "@limbu/shared/api";
import { requireWorkflowSession } from "@limbu/shared/session";
import { publishWorkflowVersion } from "@limbu/workflows";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ workflowId: string }> };

export async function POST(request: Request, { params }: Params) {
  const result = await requireWorkflowSession();
  if (result.error === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (result.error === "NO_WORKSPACE") return missingWorkspaceResponse();

  try {
    const { workflowId } = await params;
    const body = await request.json().catch(() => ({}));
    const version = await publishWorkflowVersion(workflowId, result.context, body.changeNotes);
    return NextResponse.json({ version });
  } catch (err) {
    return workflowErrorResponse(err);
  }
}
