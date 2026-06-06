import { workflowErrorResponse, missingWorkspaceResponse } from "@limbu/shared/api";
import { requireWorkflowSession } from "@limbu/shared/session";
import { getWorkspaceMetrics } from "@limbu/workflows";
import { NextResponse } from "next/server";

export async function GET() {
  const result = await requireWorkflowSession();
  if (result.error === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (result.error === "NO_WORKSPACE") return missingWorkspaceResponse();

  try {
    const metrics = await getWorkspaceMetrics(result.context);
    return NextResponse.json({ metrics });
  } catch (err) {
    return workflowErrorResponse(err);
  }
}
