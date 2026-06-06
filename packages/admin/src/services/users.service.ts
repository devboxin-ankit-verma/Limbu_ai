import { prisma } from "@limbu/db";
import type { AdminUserSummary, Paginated } from "../types";
import { AdminError, AdminNotFoundError } from "../errors";
import { writeAdminAuditLog } from "../audit";

export async function listUsers(input: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<Paginated<AdminUserSummary>> {
  const page = input.page ?? 1;
  const limit = input.limit ?? 20;
  const skip = (page - 1) * limit;

  const where = {
    ...(input.search
      ? {
          OR: [
            { email: { contains: input.search, mode: "insensitive" as const } },
            { name: { contains: input.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        name: true,
        isSuperAdmin: true,
        emailVerified: true,
        createdAt: true,
        deletedAt: true,
        _count: { select: { organizationMembers: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    items: rows.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      isSuperAdmin: u.isSuperAdmin,
      emailVerified: u.emailVerified?.toISOString() ?? null,
      createdAt: u.createdAt.toISOString(),
      organizationCount: u._count.organizationMembers,
      deletedAt: u.deletedAt?.toISOString() ?? null,
    })),
    total,
    page,
    limit,
  };
}

export async function getUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      isSuperAdmin: true,
      emailVerified: true,
      authProvider: true,
      createdAt: true,
      deletedAt: true,
      organizationMembers: {
        where: { status: "active" },
        select: {
          role: true,
          organization: { select: { id: true, name: true, slug: true } },
        },
      },
      _count: { select: { sessions: true, agentRuns: true } },
    },
  });

  if (!user) throw new AdminNotFoundError("User not found");
  return user;
}

export async function updateUser(
  userId: string,
  input: { isSuperAdmin?: boolean; restore?: boolean },
  actorId: string,
  auditOrgId: string,
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AdminNotFoundError("User not found");

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.isSuperAdmin !== undefined ? { isSuperAdmin: input.isSuperAdmin } : {}),
      ...(input.restore ? { deletedAt: null } : {}),
    },
    select: {
      id: true,
      email: true,
      isSuperAdmin: true,
      deletedAt: true,
    },
  });

  await writeAdminAuditLog({
    organizationId: auditOrgId,
    actorId,
    action: "admin.user.updated",
    resourceType: "user",
    resourceId: userId,
    metadata: input as Record<string, unknown>,
  });

  return updated;
}

export async function suspendUser(userId: string, actorId: string, auditOrgId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AdminNotFoundError("User not found");
  if (user.isSuperAdmin) throw new AdminError("Cannot suspend super admin", "FORBIDDEN", 403);

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { deletedAt: new Date() } }),
    prisma.session.deleteMany({ where: { userId } }),
  ]);

  await writeAdminAuditLog({
    organizationId: auditOrgId,
    actorId,
    action: "admin.user.suspended",
    resourceType: "user",
    resourceId: userId,
  });

  return { id: userId, suspended: true };
}
