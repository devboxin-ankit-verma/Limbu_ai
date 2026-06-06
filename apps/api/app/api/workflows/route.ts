import { workflowErrorResponse, missingWorkspaceResponse } from "@limbu/shared/api";
import { requireWorkflowSession } from "@limbu/shared/session";
import { createWorkflow, listWorkflows } from "@limbu/workflows";
import { NextResponse } from "next/server";

export async function GET() {
  const result = await requireWorkflowSession();
  if (result.error === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (result.error === "NO_WORKSPACE") return missingWorkspaceResponse();

  try {
    const workflows = await listWorkflows(result.context);
    return NextResponse.json({ workflows });
  } catch (err) {
    return workflowErrorResponse(err);
  }
}

export async function POST(request: Request) {
  const result = await requireWorkflowSession();
  if (result.error === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (result.error === "NO_WORKSPACE") return missingWorkspaceResponse();

  try {
    const body = await request.json();
    const workflow = await createWorkflow(result.context, body);
    return NextResponse.json({ workflow }, { status: 201 });
  } catch (err) {
    return workflowErrorResponse(err);
  }
}
