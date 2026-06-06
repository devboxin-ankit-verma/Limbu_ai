import { workflowErrorResponse, missingWorkspaceResponse } from "@limbu/shared/api";
import { requireWorkflowSession } from "@limbu/shared/session";
import { listWorkflowRuns, triggerWorkflowRun } from "@limbu/workflows";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ workflowId: string }> };

export async function GET(request: Request, { params }: Params) {
  const result = await requireWorkflowSession();
  if (result.error === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (result.error === "NO_WORKSPACE") return missingWorkspaceResponse();

  try {
    const { workflowId } = await params;
    const { searchParams } = new URL(request.url);
    const data = await listWorkflowRuns(workflowId, result.context, {
      cursor: searchParams.get("cursor") ?? undefined,
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
    });
    return NextResponse.json(data);
  } catch (err) {
    return workflowErrorResponse(err);
  }
}

export async function POST(request: Request, { params }: Params) {
  const result = await requireWorkflowSession();
  if (result.error === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (result.error === "NO_WORKSPACE") return missingWorkspaceResponse();

  try {
    const { workflowId } = await params;
    const body = await request.json().catch(() => ({}));
    const run = await triggerWorkflowRun(workflowId, result.context, body);
    return NextResponse.json({ run }, { status: 201 });
  } catch (err) {
    return workflowErrorResponse(err);
  }
}
