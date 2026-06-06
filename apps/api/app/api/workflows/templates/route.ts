import { workflowErrorResponse, missingWorkspaceResponse } from "@limbu/shared/api";
import { requireWorkflowSession } from "@limbu/shared/session";
import { createFromTemplate, listTemplates, seedWorkflowTemplates } from "@limbu/workflows";
import { NextResponse } from "next/server";

export async function GET() {
  const result = await requireWorkflowSession();
  if (result.error === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (result.error === "NO_WORKSPACE") return missingWorkspaceResponse();

  try {
    await seedWorkflowTemplates();
    const templates = await listTemplates(result.context.organizationId);
    return NextResponse.json({ templates });
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
    const workflow = await createFromTemplate(body.templateId, result.context, body.name);
    return NextResponse.json({ workflow }, { status: 201 });
  } catch (err) {
    return workflowErrorResponse(err);
  }
}
