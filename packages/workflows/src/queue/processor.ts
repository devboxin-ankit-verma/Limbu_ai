import {
  prisma,
  WorkflowRunStatus,
  type Prisma,
} from "@limbu/db";

export async function enqueueWorkflowRun(input: {
  workflowId: string;
  userId: string;
  workspaceId: string;
  organizationId: string;
  triggerEvent?: Record<string, unknown>;
  variables?: Record<string, unknown>;
  idempotencyKey?: string;
  scheduledAt?: Date;
}) {
  const workflow = await prisma.workflow.findUnique({
    where: { id: input.workflowId },
    include: { publishedVersion: true },
  });
  if (!workflow) throw new Error("Workflow not found");

  const { assertWorkflowRunQuota, assertFeature, trackUsage } = await import("@limbu/billing");
  const { UsageMetricCategory } = await import("@limbu/db");
  await assertFeature(input.organizationId, "workflows");
  await assertWorkflowRunQuota(input.organizationId);

  const run = await prisma.workflowRun.create({
    data: {
      workflowId: workflow.id,
      workflowVersionId: workflow.publishedVersionId,
      userId: input.userId,
      workspaceId: input.workspaceId,
      organizationId: input.organizationId,
      triggerEvent: (input.triggerEvent ?? {}) as Prisma.InputJsonValue,
      variables: (input.variables ?? {}) as Prisma.InputJsonValue,
      status: WorkflowRunStatus.pending,
    },
  });

  await trackUsage({
    organizationId: input.organizationId,
    category: UsageMetricCategory.workflow_runs,
    quantity: 1,
    referenceId: run.id,
  });

  const { trackProductEvent, PRODUCT_EVENTS } = await import("@limbu/analytics");
  void trackProductEvent({
    eventName: PRODUCT_EVENTS.WORKFLOW_RUN,
    userId: input.userId,
    organizationId: input.organizationId,
    workspaceId: input.workspaceId,
    properties: { workflowId: input.workflowId, runId: run.id },
  }).catch(() => {});

  const job = await prisma.workflowExecutionJob.create({
    data: {
      workflowId: workflow.id,
      workflowVersionId: workflow.publishedVersionId,
      runId: run.id,
      organizationId: input.organizationId,
      workspaceId: input.workspaceId,
      payload: {
        userId: input.userId,
        triggerEvent: input.triggerEvent ?? {},
        variables: input.variables ?? {},
      } as Prisma.InputJsonValue,
      scheduledAt: input.scheduledAt ?? new Date(),
      idempotencyKey: input.idempotencyKey,
    },
  });

  return job;
}
