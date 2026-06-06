import { agentErrorResponse, missingWorkspaceResponse } from "@limbu/shared/api";
import { requireAgentSession } from "@limbu/shared/session";
import { listAgentRuns, startAgentRun } from "@limbu/agents";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const result = await requireAgentSession();
  if (result.error === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (result.error === "NO_WORKSPACE") return missingWorkspaceResponse();

  try {
    const { searchParams } = new URL(request.url);
    const data = await listAgentRuns(result.context, {
      cursor: searchParams.get("cursor") ?? undefined,
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
    });
    return NextResponse.json(data);
  } catch (err) {
    return agentErrorResponse(err);
  }
}

export async function POST(request: Request) {
  const result = await requireAgentSession();
  if (result.error === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (result.error === "NO_WORKSPACE") return missingWorkspaceResponse();

  try {
    const body = await request.json();
    const run = await startAgentRun(result.context, body);
    return NextResponse.json({ run }, { status: 201 });
  } catch (err) {
    return agentErrorResponse(err);
  }
}
