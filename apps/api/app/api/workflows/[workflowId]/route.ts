import { workflowErrorResponse, missingWorkspaceResponse } from "@limbu/shared/api";
import { requireWorkflowSession } from "@limbu/shared/session";
import { deleteWorkflow, getWorkflow, updateWorkflow } from "@limbu/workflows";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ workflowId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const result = await requireWorkflowSession();
  if (result.error === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (result.error === "NO_WORKSPACE") return missingWorkspaceResponse();

  try {
    const { workflowId } = await params;
    const workflow = await getWorkflow(workflowId, result.context);
    return NextResponse.json({ workflow });
  } catch (err) {
    return workflowErrorResponse(err);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const result = await requireWorkflowSession();
  if (result.error === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (result.error === "NO_WORKSPACE") return missingWorkspaceResponse();

  try {
    const { workflowId } = await params;
    const body = await request.json();
    const workflow = await updateWorkflow(workflowId, result.context, body);
    return NextResponse.json({ workflow });
  } catch (err) {
    return workflowErrorResponse(err);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const result = await requireWorkflowSession();
  if (result.error === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (result.error === "NO_WORKSPACE") return missingWorkspaceResponse();

  try {
    const { workflowId } = await params;
    const deleted = await deleteWorkflow(workflowId, result.context);
    return NextResponse.json(deleted);
  } catch (err) {
    return workflowErrorResponse(err);
  }
}
