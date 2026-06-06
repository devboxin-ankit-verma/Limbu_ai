import { hasPermission } from "@limbu/auth/rbac";
import { prisma, WorkspaceRole } from "@limbu/db";
import { requireWorkspaceAccess } from "@limbu/workspace";
import { WORKFLOW_CONFIG } from "./config";
import { WorkflowForbiddenError, WorkflowNotFoundError } from "./errors";
import type { WorkflowExecutionContext } from "./types";

export async function requireWorkflowAccess(
  workflowId: string,
  ctx: WorkflowExecutionContext,
  options?: { write?: boolean },
) {
  const workflow = await prisma.workflow.findUnique({ where: { id: workflowId } });
  if (!workflow || workflow.organizationId !== ctx.organizationId) {
    throw new WorkflowNotFoundError();
  }
  if (workflow.workspaceId !== ctx.workspaceId && !ctx.isSuperAdmin) {
    throw new WorkflowForbiddenError();
  }

  await assertWorkflowPermission(ctx, options?.write);
  return workflow;
}

export async function assertWorkflowPermission(
  ctx: WorkflowExecutionContext,
  write?: boolean,
) {
  if (ctx.isSuperAdmin) return;

  const { orgRole, workspaceRole } = await requireWorkspaceAccess(
    ctx.workspaceId,
    ctx.userId,
    write ? WorkspaceRole.editor : WorkspaceRole.viewer,
  );

  const permission = write ? "content:edit" : "content:view";
  if (!hasPermission(permission, { orgRole, workspaceRole })) {
    throw new WorkflowForbiddenError();
  }
}

export async function requireWorkflowRunAccess(runId: string, ctx: WorkflowExecutionContext) {
  const run = await prisma.workflowRun.findUnique({ where: { id: runId } });
  if (!run || run.organizationId !== ctx.organizationId || run.workspaceId !== ctx.workspaceId) {
    throw new WorkflowNotFoundError("Run not found");
  }
  await assertWorkflowPermission(ctx);
  return run;
}

export function verifyWebhookSecret(provided: string | null, expected: string | null) {
  if (!expected) return false;
  return provided === expected;
}

export function verifyWorkerSecret(headerValue: string | null) {
  const secret = WORKFLOW_CONFIG.workerSecret;
  if (!secret) return true;
  return headerValue === secret;
}
