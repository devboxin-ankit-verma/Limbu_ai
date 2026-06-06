import type { WorkflowRunStatus, WorkflowStatus, WorkflowTriggerType } from "@limbu/db";

export type WorkflowNodeType = "trigger" | "condition" | "action";

export type WorkflowExecutionContext = {
  userId: string;
  workspaceId: string;
  organizationId: string;
  isSuperAdmin?: boolean;
};

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  kind: string;
  label?: string;
  config: Record<string, unknown>;
  position?: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
}

export interface WorkflowDefinition {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables?: Record<string, unknown>;
}

export interface WorkflowRecord {
  id: string;
  workspaceId: string;
  organizationId: string;
  name: string;
  description: string | null;
  triggerType: WorkflowTriggerType;
  triggerConfig: Record<string, unknown>;
  definition: WorkflowDefinition;
  status: WorkflowStatus;
  version: number;
  webhookSecret: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowRunRecord {
  id: string;
  workflowId: string;
  status: WorkflowRunStatus;
  triggerEvent: Record<string, unknown>;
  variables: Record<string, unknown>;
  error: string | null;
  durationMs: number | null;
  startedAt: Date;
  completedAt: Date | null;
}

export interface ExecutionLogEntry {
  nodeId: string;
  nodeType: string;
  nodeKind: string;
  status: "started" | "completed" | "skipped" | "failed";
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  durationMs?: number;
  timestamp: string;
}

export interface RunWorkflowInput {
  workflowId: string;
  triggerType?: WorkflowTriggerType;
  triggerEvent?: Record<string, unknown>;
  variables?: Record<string, unknown>;
  idempotencyKey?: string;
}

export interface WorkflowMetrics {
  totalRuns: number;
  successRate: number;
  avgDurationMs: number;
  failedRuns: number;
  lastRunAt: Date | null;
}

export type ActionHandler = (
  node: WorkflowNode,
  ctx: RuntimeContext,
) => Promise<Record<string, unknown>>;

export type ConditionHandler = (
  node: WorkflowNode,
  ctx: RuntimeContext,
) => Promise<boolean>;

export interface RuntimeContext {
  runId: string;
  workflowId: string;
  organizationId: string;
  workspaceId: string;
  userId: string;
  variables: Record<string, unknown>;
  triggerEvent: Record<string, unknown>;
  logs: ExecutionLogEntry[];
}
