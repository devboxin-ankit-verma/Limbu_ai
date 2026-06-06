import { workflowErrorResponse, missingWorkspaceResponse } from "@limbu/shared/api";
import { requireWorkflowSession } from "@limbu/shared/session";
import { getWorkflowRunDetails } from "@limbu/workflows";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ runId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const result = await requireWorkflowSession();
  if (result.error === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (result.error === "NO_WORKSPACE") return missingWorkspaceResponse();

  try {
    const { runId } = await params;
    const data = await getWorkflowRunDetails(runId, result.context);
    return NextResponse.json(data);
  } catch (err) {
    return workflowErrorResponse(err);
  }
}
