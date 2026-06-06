import { randomBytes } from "node:crypto";
import { prisma, WorkflowTriggerType, type Prisma } from "@limbu/db";
import { requireWorkflowAccess, assertWorkflowPermission } from "../access";
import { WorkflowValidationError } from "../errors";
import { parseDefinition } from "../engine/graph";
import { createWorkflowSchema, updateWorkflowSchema } from "../validators";
import type { WorkflowDefinition, WorkflowExecutionContext } from "../types";

const defaultManualDefinition = (): WorkflowDefinition => ({
  nodes: [
    {
      id: "trigger-1",
      type: "trigger",
      kind: "manual",
      label: "Manual Trigger",
      config: {},
      position: { x: 0, y: 0 },
    },
  ],
  edges: [],
});

function toRecord(workflow: {
  id: string;
  workspaceId: string;
  organizationId: string;
  name: string;
  description: string | null;
  triggerType: WorkflowTriggerType;
  triggerConfig: unknown;
  definition: unknown;
  status: string;
  version: number;
  webhookSecret: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...workflow,
    triggerConfig: (workflow.triggerConfig ?? {}) as Record<string, unknown>,
    definition: parseDefinition(workflow.definition),
  };
}

export async function listWorkflows(ctx: WorkflowExecutionContext) {
  await assertWorkflowPermission(ctx);
  const workflows = await prisma.workflow.findMany({
    where: {
      workspaceId: ctx.workspaceId,
      organizationId: ctx.organizationId,
      status: { not: "deleted" },
    },
    orderBy: { updatedAt: "desc" },
  });
  return workflows.map(toRecord);
}

export async function getWorkflow(workflowId: string, ctx: WorkflowExecutionContext) {
  const workflow = await requireWorkflowAccess(workflowId, ctx);
  return toRecord(workflow);
}

export async function createWorkflow(ctx: WorkflowExecutionContext, input: unknown) {
  await assertWorkflowPermission(ctx, true);
  const parsed = createWorkflowSchema.safeParse(input);
  if (!parsed.success) {
    throw new WorkflowValidationError(
      "Invalid workflow",
      parsed.error.flatten().fieldErrors as Record<string, string[]>,
    );
  }

  const definition = parsed.data.definition ?? defaultManualDefinition();
  const webhookSecret =
    parsed.data.triggerType === WorkflowTriggerType.webhook
      ? randomBytes(24).toString("hex")
      : null;

  const workflow = await prisma.workflow.create({
    data: {
      workspaceId: ctx.workspaceId,
      organizationId: ctx.organizationId,
      createdById: ctx.userId,
      name: parsed.data.name,
      description: parsed.data.description,
      triggerType: parsed.data.triggerType,
      triggerConfig: (parsed.data.triggerConfig ?? {}) as Prisma.InputJsonValue,
      definition: definition as unknown as Prisma.InputJsonValue,
      webhookSecret,
      templateId: parsed.data.templateId,
    },
  });

  return toRecord(workflow);
}

export async function updateWorkflow(
  workflowId: string,
  ctx: WorkflowExecutionContext,
  input: unknown,
) {
  await requireWorkflowAccess(workflowId, ctx, { write: true });
  const parsed = updateWorkflowSchema.safeParse(input);
  if (!parsed.success) {
    throw new WorkflowValidationError(
      "Invalid update",
      parsed.error.flatten().fieldErrors as Record<string, string[]>,
    );
  }

  const workflow = await prisma.workflow.update({
    where: { id: workflowId },
    data: {
      ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
      ...(parsed.data.description !== undefined ? { description: parsed.data.description } : {}),
      ...(parsed.data.triggerType !== undefined ? { triggerType: parsed.data.triggerType } : {}),
      ...(parsed.data.triggerConfig !== undefined
        ? { triggerConfig: parsed.data.triggerConfig as Prisma.InputJsonValue }
        : {}),
      ...(parsed.data.definition !== undefined
        ? { definition: parsed.data.definition as unknown as Prisma.InputJsonValue }
        : {}),
      ...(parsed.data.status !== undefined ? { status: parsed.data.status } : {}),
    },
  });

  return toRecord(workflow);
}

export async function deleteWorkflow(workflowId: string, ctx: WorkflowExecutionContext) {
  await requireWorkflowAccess(workflowId, ctx, { write: true });
  await prisma.workflow.update({
    where: { id: workflowId },
    data: { status: "deleted" },
  });
  return { id: workflowId };
}

export async function createFromTemplate(
  templateId: string,
  ctx: WorkflowExecutionContext,
  name?: string,
) {
  const template = await prisma.workflowTemplate.findFirst({
    where: {
      id: templateId,
      OR: [{ organizationId: null }, { organizationId: ctx.organizationId }],
    },
  });
  if (!template) throw new WorkflowValidationError("Template not found");

  return createWorkflow(ctx, {
    name: name ?? template.name,
    description: template.description ?? undefined,
    triggerType: template.triggerType,
    triggerConfig: template.triggerConfig as Record<string, unknown>,
    definition: template.definition as unknown as WorkflowDefinition,
    templateId: template.id,
  });
}
