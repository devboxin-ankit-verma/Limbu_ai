import { prisma, WorkflowJobStatus } from "@limbu/db";
import type { Prisma } from "@limbu/db";

export async function moveToDeadLetter(input: {
  jobId: string;
  runId?: string;
  workflowId: string;
  organizationId: string;
  workspaceId: string;
  error: string;
  payload: Record<string, unknown>;
}) {
  await prisma.$transaction([
    prisma.workflowDeadLetter.create({
      data: {
        jobId: input.jobId,
        runId: input.runId,
        workflowId: input.workflowId,
        organizationId: input.organizationId,
        workspaceId: input.workspaceId,
        error: input.error,
        payload: input.payload as Prisma.InputJsonValue,
      },
    }),
    prisma.workflowExecutionJob.update({
      where: { id: input.jobId },
      data: { status: WorkflowJobStatus.dead_letter },
    }),
  ]);
}

export async function listDeadLetters(workspaceId: string, organizationId: string, limit = 20) {
  return prisma.workflowDeadLetter.findMany({
    where: { workspaceId, organizationId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
