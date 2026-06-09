import { hasPermission } from "@limbu/auth/rbac";
import { prisma, WorkspaceRole } from "@limbu/db";
import { requireWorkspaceAccess } from "@limbu/workspace";
import { IntegrationForbiddenError, IntegrationNotFoundError } from "./errors";
import type { IntegrationContext } from "./types";

export async function assertIntegrationPermission(ctx: IntegrationContext, write?: boolean) {
  if (ctx.isSuperAdmin) return;

  const { orgRole, workspaceRole } = await requireWorkspaceAccess(
    ctx.workspaceId,
    ctx.userId,
    write ? WorkspaceRole.editor : WorkspaceRole.viewer,
  );

  const permission = write ? "content:edit" : "content:view";
  if (!hasPermission(permission, { orgRole, workspaceRole })) {
    throw new IntegrationForbiddenError();
  }
}

export async function requireConnectionAccess(connectionId: string, ctx: IntegrationContext) {
  const connection = await prisma.integrationConnection.findUnique({
    where: { id: connectionId },
    include: { locations: true, credentials: true },
  });

  if (
    !connection ||
    connection.organizationId !== ctx.organizationId ||
    connection.workspaceId !== ctx.workspaceId
  ) {
    throw new IntegrationNotFoundError();
  }

  await assertIntegrationPermission(ctx, true);
  return connection;
}
