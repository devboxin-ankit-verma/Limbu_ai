import {
  JobDeadLetterStatus,
  KnowledgeIngestJobStatus,
  WorkflowJobStatus,
  prisma,
} from "@limbu/db";
import type { QueueHealth } from "../types";

function dayAgo(): Date {
  return new Date(Date.now() - 86400000);
}

export async function getWorkflowQueueHealth(
  organizationId?: string,
): Promise<QueueHealth> {
  const base = organizationId ? { organizationId } : {};
  const since = dayAgo();

  const [pending, processing, failed, completed24h] = await Promise.all([
    prisma.workflowExecutionJob.count({
      where: { ...base, status: WorkflowJobStatus.pending },
    }),
    prisma.workflowExecutionJob.count({
      where: { ...base, status: WorkflowJobStatus.processing },
    }),
    prisma.workflowExecutionJob.count({
      where: { ...base, status: WorkflowJobStatus.failed },
    }),
    prisma.workflowExecutionJob.count({
      where: {
        ...base,
        status: WorkflowJobStatus.completed,
        completedAt: { gte: since },
      },
    }),
  ]);

  return { pending, processing, failed, completed24h };
}

export async function getRagQueueHealth(organizationId?: string): Promise<QueueHealth> {
  const since = dayAgo();

  let docFilter = {};
  if (organizationId) {
    docFilter = { document: { organizationId } };
  }

  const [pending, processing, failed] = await Promise.all([
    prisma.knowledgeIngestJob.count({
      where: { ...docFilter, status: KnowledgeIngestJobStatus.pending },
    }),
    prisma.knowledgeIngestJob.count({
      where: { ...docFilter, status: KnowledgeIngestJobStatus.processing },
    }),
    prisma.knowledgeIngestJob.count({
      where: { ...docFilter, status: KnowledgeIngestJobStatus.failed },
    }),
  ]);

  const completed24h = await prisma.knowledgeIngestJob.count({
    where: {
      ...docFilter,
      status: KnowledgeIngestJobStatus.completed,
      completedAt: { gte: since },
    },
  });

  return { pending, processing, failed, completed24h };
}

export async function getDeadLetterStats(organizationId?: string) {
  const base = organizationId ? { organizationId } : {};
  const [open, total] = await Promise.all([
    prisma.jobDeadLetter.count({
      where: { ...base, status: JobDeadLetterStatus.open },
    }),
    prisma.jobDeadLetter.count({ where: base }),
  ]);
  return { open, total };
}

export async function getQueueHealthSummary(organizationId?: string) {
  const [workflow, rag, deadLetter] = await Promise.all([
    getWorkflowQueueHealth(organizationId),
    getRagQueueHealth(organizationId),
    getDeadLetterStats(organizationId),
  ]);
  return { workflow, rag, deadLetter };
}
