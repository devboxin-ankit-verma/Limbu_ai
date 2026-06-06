import {
  prisma,
  WorkflowJobStatus,
  WorkflowRunStatus,
  type Prisma,
} from "@limbu/db";
import {
  WORKFLOW_CONFIG,
  parseDefinition,
  executeWorkflowGraph,
  moveToDeadLetter,
} from "@limbu/workflows";

export async function processPendingJobs(limit = WORKFLOW_CONFIG.workerBatchSize) {
  const jobs = await prisma.workflowExecutionJob.findMany({
    where: {
      status: WorkflowJobStatus.pending,
      scheduledAt: { lte: new Date() },
    },
    orderBy: [{ priority: "desc" }, { scheduledAt: "asc" }],
    take: limit,
  });

  for (const job of jobs) {
    await processJob(job.id);
  }
  return jobs.length;
}

export async function processJob(jobId: string) {
  const job = await prisma.workflowExecutionJob.findUnique({ where: { id: jobId } });
  if (!job || job.status !== WorkflowJobStatus.pending) return;

  await prisma.workflowExecutionJob.update({
    where: { id: jobId },
    data: { status: WorkflowJobStatus.processing, startedAt: new Date(), attempts: { increment: 1 } },
  });

  const run = job.runId
    ? await prisma.workflowRun.findUnique({ where: { id: job.runId } })
    : null;
  if (!run) {
    await failJob(job, "Run not found");
    return;
  }

  const workflow = await prisma.workflow.findUnique({
    where: { id: job.workflowId },
    include: { publishedVersion: true },
  });
  if (!workflow) {
    await failJob(job, "Workflow not found");
    return;
  }

  const startedAt = Date.now();

  try {
    await prisma.workflowRun.update({
      where: { id: run.id },
      data: { status: WorkflowRunStatus.running },
    });

    const definitionSource = workflow.publishedVersion?.definition ?? workflow.definition;
    const definition = parseDefinition(definitionSource);
    const payload = job.payload as Record<string, unknown>;

    const result = await executeWorkflowGraph({
      runId: run.id,
      workflowId: workflow.id,
      organizationId: job.organizationId,
      workspaceId: job.workspaceId,
      userId: String(payload.userId ?? run.userId),
      definition,
      triggerEvent: (payload.triggerEvent as Record<string, unknown>) ?? {},
      variables: (payload.variables as Record<string, unknown>) ?? {},
    });

    const durationMs = Date.now() - startedAt;

    await prisma.$transaction([
      prisma.workflowRun.update({
        where: { id: run.id },
        data: {
          status: WorkflowRunStatus.completed,
          variables: result.variables as Prisma.InputJsonValue,
          logs: result.logs as unknown as Prisma.InputJsonValue,
          durationMs,
          completedAt: new Date(),
          metrics: {
            nodeCount: result.logs.length,
            durationMs,
          } as Prisma.InputJsonValue,
        },
      }),
      prisma.workflowExecutionJob.update({
        where: { id: job.id },
        data: {
          status: WorkflowJobStatus.completed,
          completedAt: new Date(),
        },
      }),
    ]);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Execution failed";
    const attempts = job.attempts + 1;

    if (attempts < job.maxAttempts) {
      await prisma.workflowExecutionJob.update({
        where: { id: job.id },
        data: {
          status: WorkflowJobStatus.pending,
          lastError: message,
          scheduledAt: new Date(Date.now() + WORKFLOW_CONFIG.retryBaseDelayMs * 2 ** (attempts - 1)),
        },
      });
      await prisma.workflowRun.update({
        where: { id: run.id },
        data: { status: WorkflowRunStatus.pending, error: message },
      });
      return;
    }

    await failJob(job, message, run.id);
  }
}

async function failJob(
  job: { id: string; workflowId: string; organizationId: string; workspaceId: string; payload: unknown },
  error: string,
  runId?: string,
) {
  await prisma.$transaction([
    prisma.workflowExecutionJob.update({
      where: { id: job.id },
      data: {
        status: WorkflowJobStatus.failed,
        lastError: error,
        completedAt: new Date(),
      },
    }),
    ...(runId
      ? [
          prisma.workflowRun.update({
            where: { id: runId },
            data: {
              status: WorkflowRunStatus.failed,
              error,
              completedAt: new Date(),
            },
          }),
        ]
      : []),
  ]);

  await moveToDeadLetter({
    jobId: job.id,
    runId,
    workflowId: job.workflowId,
    organizationId: job.organizationId,
    workspaceId: job.workspaceId,
    error,
    payload: job.payload as Record<string, unknown>,
  });
}

let draining = false;

export async function drainWorkflowQueue() {
  if (draining) return;
  draining = true;
  try {
    while (true) {
      const processed = await processPendingJobs(1);
      if (processed === 0) break;
    }
  } finally {
    draining = false;
  }
}
