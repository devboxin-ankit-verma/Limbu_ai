import { hasPermission } from "@limbu/auth/rbac";
import { prisma, WorkspaceRole } from "@limbu/db";
import { requireWorkspaceAccess } from "@limbu/workspace";
import { AgentForbiddenError } from "./errors";
import type { AgentExecutionContext } from "./types";

export async function requireAgentAccess(
  ctx: AgentExecutionContext,
  options?: { write?: boolean },
) {
  if (ctx.isSuperAdmin) return;

  const { orgRole, workspaceRole } = await requireWorkspaceAccess(
    ctx.workspaceId,
    ctx.userId,
    options?.write ? WorkspaceRole.editor : WorkspaceRole.viewer,
  );

  const permission = options?.write ? "content:edit" : "content:view";
  if (!hasPermission(permission, { orgRole, workspaceRole })) {
    throw new AgentForbiddenError();
  }
}

export async function requireAgentRunAccess(runId: string, ctx: AgentExecutionContext) {
  const run = await prisma.agentRun.findUnique({ where: { id: runId } });
  if (!run || run.organizationId !== ctx.organizationId) {
    throw new AgentForbiddenError("Run not found");
  }
  if (run.userId !== ctx.userId && !ctx.isSuperAdmin) {
    throw new AgentForbiddenError();
  }
  await requireAgentAccess(ctx);
  return run;
}
