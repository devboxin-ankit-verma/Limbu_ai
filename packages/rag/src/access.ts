import { hasPermission } from "@limbu/auth/rbac";
import { KnowledgeBaseScope, prisma, WorkspaceRole } from "@limbu/db";
import { requireWorkspaceAccess } from "@limbu/workspace";
import { RagForbiddenError, RagNotFoundError } from "./errors";
import type { RagAccessContext } from "./types";

export async function requireKnowledgeBaseAccess(
  knowledgeBaseId: string,
  ctx: RagAccessContext,
  options?: { write?: boolean },
) {
  const kb = await prisma.knowledgeBase.findUnique({
    where: { id: knowledgeBaseId },
  });
  if (!kb) throw new RagNotFoundError("Knowledge base not found");
  if (kb.organizationId !== ctx.organizationId) throw new RagForbiddenError();

  await assertScopeAccess(kb.scope, kb, ctx, options?.write);
  return kb;
}

export async function assertScopeAccess(
  scope: KnowledgeBaseScope,
  kb: {
    organizationId: string;
    workspaceId: string | null;
    userId: string | null;
  },
  ctx: RagAccessContext,
  write?: boolean,
) {
  if (ctx.isSuperAdmin) return;

  switch (scope) {
    case KnowledgeBaseScope.personal:
      if (kb.userId !== ctx.userId) throw new RagForbiddenError();
      return;
    case KnowledgeBaseScope.organization: {
      const member = await prisma.organizationMember.findFirst({
        where: {
          organizationId: kb.organizationId,
          userId: ctx.userId,
          status: "active",
        },
      });
      if (!member) throw new RagForbiddenError();
      const permission = write ? "content:edit" : "content:view";
      if (!hasPermission(permission, { orgRole: member.role })) throw new RagForbiddenError();
      return;
    }
    case KnowledgeBaseScope.workspace: {
      if (!kb.workspaceId) throw new RagForbiddenError();
      const { orgRole, workspaceRole } = await requireWorkspaceAccess(
        kb.workspaceId,
        ctx.userId,
        write ? WorkspaceRole.editor : WorkspaceRole.viewer,
      );
      const permission = write ? "content:edit" : "content:view";
      if (!hasPermission(permission, { orgRole, workspaceRole })) throw new RagForbiddenError();
      return;
    }
    default:
      throw new RagForbiddenError();
  }
}

export function buildRetrievalScopeFilter(ctx: RagAccessContext) {
  return {
    organizationId: ctx.organizationId,
    OR: [
      {
        scope: KnowledgeBaseScope.workspace,
        workspaceId: ctx.workspaceId ?? undefined,
      },
      { scope: KnowledgeBaseScope.organization },
      {
        scope: KnowledgeBaseScope.personal,
        userId: ctx.userId,
      },
    ],
  };
}
