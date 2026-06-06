import { prisma, type Prisma } from "@limbu/db";
import type { WorkflowExecutionContext } from "../types";
import { requireWorkflowAccess } from "../access";

export async function publishWorkflowVersion(
  workflowId: string,
  ctx: WorkflowExecutionContext,
  changeNotes?: string,
) {
  const workflow = await requireWorkflowAccess(workflowId, ctx, { write: true });
  const nextVersion = workflow.version + 1;

  const version = await prisma.$transaction(async (tx) => {
    const created = await tx.workflowVersion.create({
      data: {
        workflowId,
        organizationId: workflow.organizationId,
        workspaceId: workflow.workspaceId,
        version: nextVersion,
        definition: workflow.definition as Prisma.InputJsonValue,
        triggerConfig: workflow.triggerConfig as Prisma.InputJsonValue,
        changeNotes,
        createdById: ctx.userId,
      },
    });

    await tx.workflow.update({
      where: { id: workflowId },
      data: {
        version: nextVersion,
        publishedVersionId: created.id,
        status: "active",
      },
    });

    return created;
  });

  return version;
}

export async function listWorkflowVersions(workflowId: string, ctx: WorkflowExecutionContext) {
  await requireWorkflowAccess(workflowId, ctx);
  return prisma.workflowVersion.findMany({
    where: { workflowId },
    orderBy: { version: "desc" },
  });
}
