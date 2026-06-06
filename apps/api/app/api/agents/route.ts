import { agentErrorResponse, missingWorkspaceResponse } from "@limbu/shared/api";
import { requireAgentSession } from "@limbu/shared/session";
import { getAgentRegistry } from "@limbu/agents";
import { NextResponse } from "next/server";

export async function GET() {
  const result = await requireAgentSession();
  if (result.error === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (result.error === "NO_WORKSPACE") return missingWorkspaceResponse();

  return NextResponse.json({ agents: getAgentRegistry() });
}
