import { WorkflowStatus, WorkflowTriggerType } from "@limbu/db";
import { z } from "zod";

const nodeSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["trigger", "condition", "action"]),
  kind: z.string().min(1),
  label: z.string().optional(),
  config: z.record(z.unknown()).default({}),
  position: z.object({ x: z.number(), y: z.number() }).optional(),
});

const edgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  sourceHandle: z.string().optional(),
});

export const workflowDefinitionSchema = z.object({
  nodes: z.array(nodeSchema),
  edges: z.array(edgeSchema),
  variables: z.record(z.unknown()).optional(),
});

export const createWorkflowSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).optional(),
  triggerType: z.nativeEnum(WorkflowTriggerType).default(WorkflowTriggerType.manual),
  triggerConfig: z.record(z.unknown()).optional(),
  definition: workflowDefinitionSchema.optional(),
  templateId: z.string().uuid().optional(),
});

export const updateWorkflowSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  triggerType: z.nativeEnum(WorkflowTriggerType).optional(),
  triggerConfig: z.record(z.unknown()).optional(),
  definition: workflowDefinitionSchema.optional(),
  status: z.nativeEnum(WorkflowStatus).optional(),
});

export const runWorkflowSchema = z.object({
  variables: z.record(z.unknown()).optional(),
  triggerEvent: z.record(z.unknown()).optional(),
  idempotencyKey: z.string().max(120).optional(),
});

export const publishWorkflowSchema = z.object({
  changeNotes: z.string().trim().max(500).optional(),
});

export const listRunsSchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.number().int().min(1).max(50).optional(),
});
