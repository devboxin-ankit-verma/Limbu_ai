import { prisma, WorkflowRunStatus } from "@limbu/db";

function dayAgo(): Date {
  return new Date(Date.now() - 86400000);
}

export async function getWorkflowMetrics(organizationId?: string, workspaceId?: string) {
  const since = dayAgo();
  const where = {
    ...(organizationId ? { organizationId } : {}),
    ...(workspaceId ? { workspaceId } : {}),
    startedAt: { gte: since },
  };

  const runs = await prisma.workflowRun.findMany({
    where,
    select: { status: true, durationMs: true },
  });

  const totalRuns24h = runs.length;
  const failedRuns24h = runs.filter((r) => r.status === WorkflowRunStatus.failed).length;
  const completed = runs.filter((r) => r.status === WorkflowRunStatus.completed);
  const avgDurationMs =
    completed.length > 0
      ? Math.round(
          completed.reduce((sum, r) => sum + (r.durationMs ?? 0), 0) / completed.length,
        )
      : 0;

  return {
    totalRuns24h,
    failedRuns24h,
    successRate: totalRuns24h > 0 ? (totalRuns24h - failedRuns24h) / totalRuns24h : 0,
    avgDurationMs,
  };
}

export async function getWorkflowMetricsTrend(organizationId: string, days = 7) {
  const from = new Date();
  from.setUTCDate(from.getUTCDate() - days);

  const runs = await prisma.workflowRun.findMany({
    where: { organizationId, startedAt: { gte: from } },
    select: { status: true, startedAt: true },
  });

  const byDay = new Map<string, { total: number; failed: number }>();
  for (const run of runs) {
    const key = run.startedAt?.toISOString().slice(0, 10) ?? "unknown";
    const entry = byDay.get(key) ?? { total: 0, failed: 0 };
    entry.total++;
    if (run.status === WorkflowRunStatus.failed) entry.failed++;
    byDay.set(key, entry);
  }

  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({
      date,
      total: data.total,
      failed: data.failed,
      successRate: data.total > 0 ? (data.total - data.failed) / data.total : 0,
    }));
}
