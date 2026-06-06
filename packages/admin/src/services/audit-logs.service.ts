import { prisma } from "@limbu/db";
import type { AdminAuditLogRow, Paginated } from "../types";

export async function listAuditLogs(input: {
  page?: number;
  limit?: number;
  organizationId?: string;
  action?: string;
}): Promise<Paginated<AdminAuditLogRow>> {
  const page = input.page ?? 1;
  const limit = input.limit ?? 30;
  const skip = (page - 1) * limit;

  const where = {
    ...(input.organizationId ? { organizationId: input.organizationId } : {}),
    ...(input.action ? { action: { contains: input.action, mode: "insensitive" as const } } : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        organization: { select: { name: true } },
        actor: { select: { email: true } },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    items: rows.map((r) => ({
      id: r.id,
      organizationId: r.organizationId,
      organizationName: r.organization.name,
      actorId: r.actorId,
      actorEmail: r.actor?.email ?? null,
      action: r.action,
      resourceType: r.resourceType,
      resourceId: r.resourceId,
      metadata: r.metadata as Record<string, unknown>,
      createdAt: r.createdAt.toISOString(),
    })),
    total,
    page,
    limit,
  };
}
