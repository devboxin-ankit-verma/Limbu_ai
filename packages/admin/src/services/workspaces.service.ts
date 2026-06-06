import { prisma } from "@limbu/db";
import type { AdminWorkspaceSummary, Paginated } from "../types";

export async function listWorkspaces(input: {
  page?: number;
  limit?: number;
  search?: string;
  organizationId?: string;
}): Promise<Paginated<AdminWorkspaceSummary>> {
  const page = input.page ?? 1;
  const limit = input.limit ?? 20;
  const skip = (page - 1) * limit;

  const where = {
    deletedAt: null,
    ...(input.organizationId ? { organizationId: input.organizationId } : {}),
    ...(input.search
      ? {
          OR: [
            { name: { contains: input.search, mode: "insensitive" as const } },
            { organization: { name: { contains: input.search, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.workspace.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        status: true,
        organizationId: true,
        createdAt: true,
        organization: { select: { name: true } },
        _count: { select: { members: true } },
      },
    }),
    prisma.workspace.count({ where }),
  ]);

  return {
    items: rows.map((w) => ({
      id: w.id,
      name: w.name,
      organizationId: w.organizationId,
      organizationName: w.organization.name,
      status: w.status,
      memberCount: w._count.members,
      createdAt: w.createdAt.toISOString(),
    })),
    total,
    page,
    limit,
  };
}
