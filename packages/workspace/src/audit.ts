import { prisma, type Prisma } from "@limbu/db";

export async function writeWorkspaceAuditLog(input: {
  organizationId: string;
  actorId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
}) {
  await prisma.auditLog.create({
    data: {
      organizationId: input.organizationId,
      actorId: input.actorId,
      action: input.action,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
    },
  });
}
