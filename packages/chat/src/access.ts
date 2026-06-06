import { hasPermission } from "@limbu/auth/rbac";
import { prisma, WorkspaceRole } from "@limbu/db";
import { requireWorkspaceAccess } from "@limbu/workspace";
import { ChatForbiddenError, ChatNotFoundError } from "./errors";

export async function requireThreadAccess(
  threadId: string,
  userId: string,
  options?: { write?: boolean; isSuperAdmin?: boolean },
) {
  const thread = await prisma.aiThread.findUnique({
    where: { id: threadId },
    select: {
      id: true,
      userId: true,
      workspaceId: true,
      organizationId: true,
      title: true,
      archivedAt: true,
      pinnedAt: true,
    },
  });

  if (!thread) throw new ChatNotFoundError();
  if (thread.userId !== userId && !options?.isSuperAdmin) {
    throw new ChatForbiddenError();
  }

  const { workspaceRole, orgRole } = await requireWorkspaceAccess(
    thread.workspaceId,
    userId,
    options?.write ? WorkspaceRole.editor : WorkspaceRole.viewer,
  );

  const permission = options?.write ? "content:edit" : "content:view";
  if (
    !options?.isSuperAdmin &&
    !hasPermission(permission, {
      orgRole,
      workspaceRole,
    })
  ) {
    throw new ChatForbiddenError();
  }

  return thread;
}

export async function requireWorkspaceChatAccess(
  workspaceId: string,
  organizationId: string,
  userId: string,
  options?: { write?: boolean; isSuperAdmin?: boolean },
) {
  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, organizationId, deletedAt: null },
    select: { id: true },
  });
  if (!workspace) throw new ChatNotFoundError("Workspace not found");

  const { workspaceRole, orgRole } = await requireWorkspaceAccess(
    workspaceId,
    userId,
    options?.write ? WorkspaceRole.editor : WorkspaceRole.viewer,
  );

  const permission = options?.write ? "content:edit" : "content:view";
  if (
    !options?.isSuperAdmin &&
    !hasPermission(permission, { orgRole, workspaceRole })
  ) {
    throw new ChatForbiddenError();
  }

  return { workspaceId, organizationId, orgRole, workspaceRole };
}
