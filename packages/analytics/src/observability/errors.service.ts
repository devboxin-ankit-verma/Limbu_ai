import { ObservabilitySeverity, prisma, type Prisma } from "@limbu/db";

export async function recordError(input: {
  source: string;
  message: string;
  code?: string;
  stack?: string;
  severity?: ObservabilitySeverity;
  organizationId?: string;
  workspaceId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}) {
  await prisma.observabilityError.create({
    data: {
      source: input.source,
      message: input.message.slice(0, 4000),
      code: input.code,
      stack: input.stack?.slice(0, 8000),
      severity: input.severity ?? ObservabilitySeverity.error,
      organizationId: input.organizationId,
      workspaceId: input.workspaceId,
      userId: input.userId,
      metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
    },
  });
}

export async function listRecentErrors(input: {
  organizationId?: string;
  limit?: number;
  since?: Date;
}) {
  return prisma.observabilityError.findMany({
    where: {
      ...(input.organizationId ? { organizationId: input.organizationId } : {}),
      ...(input.since ? { createdAt: { gte: input.since } } : {}),
      resolvedAt: null,
    },
    orderBy: { createdAt: "desc" },
    take: input.limit ?? 20,
  });
}

export async function getErrorStats(organizationId?: string) {
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 86400000);
  const weekAgo = new Date(now.getTime() - 7 * 86400000);

  const baseWhere = organizationId ? { organizationId } : {};

  const [total24h, total7d, bySourceRaw] = await Promise.all([
    prisma.observabilityError.count({
      where: { ...baseWhere, createdAt: { gte: dayAgo } },
    }),
    prisma.observabilityError.count({
      where: { ...baseWhere, createdAt: { gte: weekAgo } },
    }),
    prisma.observabilityError.groupBy({
      by: ["source"],
      where: { ...baseWhere, createdAt: { gte: weekAgo } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
  ]);

  return {
    total24h,
    total7d,
    bySource: bySourceRaw.map((r) => ({ source: r.source, count: r._count.id })),
  };
}
