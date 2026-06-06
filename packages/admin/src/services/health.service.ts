import { prisma } from "@limbu/db";
import { getErrorStats, getQueueHealthSummary, getWorkflowMetrics } from "@limbu/analytics";
import type { SystemHealthReport } from "../types";

export async function getSystemHealth(): Promise<SystemHealthReport> {
  const dbStart = Date.now();
  let dbOk = true;
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dbOk = false;
  }
  const dbLatencyMs = Date.now() - dbStart;

  const [errors, queues, workflows] = await Promise.all([
    getErrorStats(),
    getQueueHealthSummary(),
    getWorkflowMetrics(),
  ]);

  let status: SystemHealthReport["status"] = "healthy";
  if (!dbOk || errors.total24h > 100) status = "unhealthy";
  else if (
    errors.total24h > 20 ||
    queues.workflow.failed > 10 ||
    queues.rag.failed > 10 ||
    queues.deadLetter.open > 5
  ) {
    status = "degraded";
  }

  return {
    status,
    database: { ok: dbOk, latencyMs: dbLatencyMs },
    queues: {
      workflow: {
        pending: queues.workflow.pending,
        failed: queues.workflow.failed,
      },
      rag: {
        pending: queues.rag.pending,
        failed: queues.rag.failed,
      },
      deadLetterOpen: queues.deadLetter.open,
    },
    errors: {
      last24h: errors.total24h,
      last7d: errors.total7d,
    },
    workflows: {
      successRate24h: workflows.successRate,
      totalRuns24h: workflows.totalRuns24h,
    },
    version: process.env.npm_package_version ?? "0.0.1",
    checkedAt: new Date().toISOString(),
  };
}
