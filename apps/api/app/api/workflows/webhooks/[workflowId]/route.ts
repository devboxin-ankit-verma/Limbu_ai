import { prisma } from "@limbu/db";
import { triggerWebhookRun, verifyWebhookSecret } from "@limbu/workflows";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ workflowId: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const { workflowId } = await params;
    const workflow = await prisma.workflow.findUnique({ where: { id: workflowId } });
    if (!workflow || workflow.status !== "active") {
      return NextResponse.json({ error: "Workflow not found or inactive" }, { status: 404 });
    }

    const secret = request.headers.get("x-workflow-secret");
    if (!verifyWebhookSecret(secret, workflow.webhookSecret)) {
      return NextResponse.json({ error: "Invalid webhook secret" }, { status: 401 });
    }

    const payload = await request.json().catch(() => ({}));
    const userId = workflow.createdById;
    if (!userId) {
      return NextResponse.json({ error: "Workflow has no owner" }, { status: 400 });
    }

    const job = await triggerWebhookRun(
      workflowId,
      payload as Record<string, unknown>,
      userId,
      workflow.workspaceId,
      workflow.organizationId,
    );

    return NextResponse.json({ jobId: job.id, runId: job.runId }, { status: 202 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
