import { prisma } from "@limbu/db";
import { requireWorkflowAccess, requireWorkflowRunAccess } from "../access";
import { enqueueWorkflowRun } from "../queue/processor";
import { runWorkflowSchema, listRunsSchema } from "../validators";
import { WorkflowValidationError } from "../errors";
import type { WorkflowExecutionContext } from "../types";

export async function triggerWorkflowRun(
  workflowId: string,
  ctx: WorkflowExecutionContext,
  input?: unknown,
) {
  const workflow = await requireWorkflowAccess(workflowId, ctx, { write: true });
  if (workflow.status !== "active" && workflow.status !== "draft") {
    throw new WorkflowValidationError("Workflow must be active or draft to run");
  }

  const parsed = runWorkflowSchema.safeParse(input ?? {});
  if (!parsed.success) throw new WorkflowValidationError("Invalid run request");

  const job = await enqueueWorkflowRun({
    workflowId,
    userId: ctx.userId,
    workspaceId: ctx.workspaceId,
    organizationId: ctx.organizationId,
    triggerEvent: parsed.data.triggerEvent ?? { type: "manual" },
    variables: parsed.data.variables,
    idempotencyKey: parsed.data.idempotencyKey,
  });

  return prisma.workflowRun.findUnique({ where: { id: job.runId! } });
}

export async function listWorkflowRuns(
  workflowId: string,
  ctx: WorkflowExecutionContext,
  query?: { cursor?: string; limit?: number },
) {
  await requireWorkflowAccess(workflowId, ctx);
  const parsed = listRunsSchema.safeParse(query ?? {});
  if (!parsed.success) throw new WorkflowValidationError("Invalid query");

  const limit = parsed.data.limit ?? 20;
  const runs = await prisma.workflowRun.findMany({
    where: { workflowId },
    orderBy: [{ startedAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    ...(parsed.data.cursor ? { cursor: { id: parsed.data.cursor }, skip: 1 } : {}),
  });

  const hasMore = runs.length > limit;
  const page = hasMore ? runs.slice(0, limit) : runs;
  return {
    runs: page,
    nextCursor: hasMore ? page[page.length - 1]?.id ?? null : null,
    hasMore,
  };
}

export async function getWorkflowRunDetails(runId: string, ctx: WorkflowExecutionContext) {
  await requireWorkflowRunAccess(runId, ctx);
  const [run, stepLogs, messages] = await Promise.all([
    prisma.workflowRun.findUnique({
      where: { id: runId },
      include: { workflow: { select: { id: true, name: true } } },
    }),
    prisma.workflowExecutionLog.findMany({
      where: { runId },
      orderBy: { startedAt: "asc" },
    }),
    prisma.workflowExecutionJob.findMany({
      where: { runId },
      orderBy: { createdAt: "asc" },
    }),
  ]);
  return { run, stepLogs, jobs: messages };
}

export async function getWorkspaceMetrics(ctx: WorkflowExecutionContext) {
  const runs = await prisma.workflowRun.findMany({
    where: { workspaceId: ctx.workspaceId, organizationId: ctx.organizationId },
    select: { status: true, durationMs: true, startedAt: true },
  });

  const totalRuns = runs.length;
  const failedRuns = runs.filter((r) => r.status === "failed").length;
  const completed = runs.filter((r) => r.status === "completed");
  const avgDurationMs =
    completed.length > 0
      ? Math.round(
          completed.reduce((sum, r) => sum + (r.durationMs ?? 0), 0) / completed.length,
        )
      : 0;

  return {
    totalRuns,
    failedRuns,
    successRate: totalRuns > 0 ? (totalRuns - failedRuns) / totalRuns : 0,
    avgDurationMs,
    lastRunAt: runs[0]?.startedAt ?? null,
  };
}

export async function triggerWebhookRun(
  workflowId: string,
  payload: Record<string, unknown>,
  userId: string,
  workspaceId: string,
  organizationId: string,
) {
  const job = await enqueueWorkflowRun({
    workflowId,
    userId,
    workspaceId,
    organizationId,
    triggerEvent: { type: "webhook", payload },
    variables: payload,
  });
  return job;
}
