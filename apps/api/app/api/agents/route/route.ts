import { agentErrorResponse, missingWorkspaceResponse } from "@limbu/shared/api";
import { requireAgentSession } from "@limbu/shared/session";
import { routeTaskPreview } from "@limbu/agents";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  task: z.string().trim().min(1),
  agentKey: z.enum(["supervisor", "research", "coding", "content", "analytics"]).optional(),
});

export async function POST(request: Request) {
  const result = await requireAgentSession();
  if (result.error === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (result.error === "NO_WORKSPACE") return missingWorkspaceResponse();

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const route = await routeTaskPreview(parsed.data.task, parsed.data.agentKey);
    return NextResponse.json({ route });
  } catch (err) {
    return agentErrorResponse(err);
  }
}
