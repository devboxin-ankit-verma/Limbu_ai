import { prisma, type Prisma } from "@limbu/db";

export async function resolveAuditOrgId(userId: string, sessionOrgId?: string | null): Promise<string> {
  if (sessionOrgId) return sessionOrgId;

  const membership = await prisma.organizationMember.findFirst({
    where: { userId, status: "active" },
    select: { organizationId: true },
    orderBy: { createdAt: "asc" },
  });
  if (membership) return membership.organizationId;

  const org = await prisma.organization.findFirst({
    where: { deletedAt: null },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  if (!org) throw new Error("No organization available for platform audit logging");
  return org.id;
}

export async function writeAdminAuditLog(input: {
  organizationId: string;
  actorId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
}) {
  await prisma.auditLog.create({
    data: {
      organizationId: input.organizationId,
      actorId: input.actorId,
      action: input.action,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
      ip: input.ip,
    },
  });
}
