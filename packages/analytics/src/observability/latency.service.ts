import { prisma, type Prisma } from "@limbu/db";
import { percentile } from "../utils/time";

export async function recordLatency(input: {
  name: string;
  durationMs: number;
  organizationId?: string;
  workspaceId?: string;
  tags?: Record<string, unknown>;
}) {
  await prisma.observabilityMetric.create({
    data: {
      name: input.name,
      value: input.durationMs,
      unit: "ms",
      organizationId: input.organizationId,
      workspaceId: input.workspaceId,
      tags: (input.tags ?? {}) as Prisma.InputJsonValue,
    },
  });
}

export async function recordMetric(input: {
  name: string;
  value: number;
  unit?: string;
  organizationId?: string;
  workspaceId?: string;
  tags?: Record<string, unknown>;
}) {
  await prisma.observabilityMetric.create({
    data: {
      name: input.name,
      value: input.value,
      unit: input.unit ?? "count",
      organizationId: input.organizationId,
      workspaceId: input.workspaceId,
      tags: (input.tags ?? {}) as Prisma.InputJsonValue,
    },
  });
}

export async function getLatencyStats(organizationId?: string, hours = 24) {
  const since = new Date(Date.now() - hours * 3600000);
  const where = {
    ...(organizationId ? { organizationId } : {}),
    recordedAt: { gte: since },
    name: { contains: ".latency" },
  };

  const metrics = await prisma.observabilityMetric.findMany({
    where,
    select: { name: true, value: true },
  });

  const values = metrics.map((m) => Number(m.value));
  const byName = new Map<string, number[]>();
  for (const m of metrics) {
    const list = byName.get(m.name) ?? [];
    list.push(Number(m.value));
    byName.set(m.name, list);
  }

  return {
    p50Ms: percentile(values, 50),
    p95Ms: percentile(values, 95),
    p99Ms: percentile(values, 99),
    byEndpoint: [...byName.entries()]
      .map(([name, vals]) => ({
        name: name.replace(".latency", ""),
        p50Ms: percentile(vals, 50),
        p95Ms: percentile(vals, 95),
        count: vals.length,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15),
  };
}

export async function withLatency<T>(
  name: string,
  fn: () => Promise<T>,
  context?: { organizationId?: string; workspaceId?: string; tags?: Record<string, unknown> },
): Promise<T> {
  const start = Date.now();
  try {
    return await fn();
  } finally {
    const durationMs = Date.now() - start;
    void recordLatency({
      name: `${name}.latency`,
      durationMs,
      organizationId: context?.organizationId,
      workspaceId: context?.workspaceId,
      tags: context?.tags,
    }).catch(() => {});
  }
}
