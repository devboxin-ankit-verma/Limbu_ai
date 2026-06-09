import { hasPermission } from "@limbu/auth/rbac";
import { prisma, WorkspaceRole } from "@limbu/db";
import { requireWorkspaceAccess } from "@limbu/workspace";
import { ContentForbiddenError, PostNotFoundError } from "./errors";
import type { ContentContext } from "./types";

export async function assertContentPermission(ctx: ContentContext, write?: boolean) {
  if (ctx.isSuperAdmin) return;

  const { orgRole, workspaceRole } = await requireWorkspaceAccess(
    ctx.workspaceId,
    ctx.userId,
    write ? WorkspaceRole.editor : WorkspaceRole.viewer,
  );

  const permission = write ? "content:edit" : "content:view";
  if (!hasPermission(permission, { orgRole, workspaceRole })) {
    throw new ContentForbiddenError();
  }
}

export async function requirePostAccess(postId: string, ctx: ContentContext, write?: boolean) {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (
    !post ||
    post.organizationId !== ctx.organizationId ||
    post.workspaceId !== ctx.workspaceId ||
    post.deletedAt
  ) {
    throw new PostNotFoundError();
  }
  await assertContentPermission(ctx, write);
  return post;
}
