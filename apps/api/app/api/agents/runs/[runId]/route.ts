import { agentErrorResponse, missingWorkspaceResponse } from "@limbu/shared/api";
import { requireAgentSession } from "@limbu/shared/session";
import { getAgentRun } from "@limbu/agents";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ runId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const result = await requireAgentSession();
  if (result.error === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (result.error === "NO_WORKSPACE") return missingWorkspaceResponse();

  try {
    const { runId } = await params;
    const data = await getAgentRun(runId, result.context);
    return NextResponse.json(data);
  } catch (err) {
    return agentErrorResponse(err);
  }
}
