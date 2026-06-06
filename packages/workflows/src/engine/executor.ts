import { prisma, type Prisma } from "@limbu/db";
import { getTriggerNode, parseDefinition, selectNextNodes } from "./graph";
import { evaluateCondition, getConditionBranch } from "../registry/conditions";
import { executeAction } from "../registry/actions";
import type { ExecutionLogEntry, RuntimeContext, WorkflowDefinition, WorkflowNode } from "../types";

export async function executeWorkflowGraph(input: {
  runId: string;
  workflowId: string;
  organizationId: string;
  workspaceId: string;
  userId: string;
  definition: WorkflowDefinition;
  triggerEvent: Record<string, unknown>;
  variables: Record<string, unknown>;
}) {
  const ctx: RuntimeContext = {
    runId: input.runId,
    workflowId: input.workflowId,
    organizationId: input.organizationId,
    workspaceId: input.workspaceId,
    userId: input.userId,
    variables: { ...input.definition.variables, ...input.variables },
    triggerEvent: input.triggerEvent,
    logs: [],
  };

  const trigger = getTriggerNode(input.definition);
  if (!trigger) throw new Error("Workflow has no trigger node");

  await logStep(input.runId, trigger, "started", { input: ctx.triggerEvent });
  await logStep(input.runId, trigger, "completed", { output: { triggered: true } });

  const queue: Array<{ node: WorkflowNode; branch?: string }> = selectNextNodes(
    input.definition,
    trigger.id,
  ).map((node) => ({ node }));

  while (queue.length > 0) {
    const current = queue.shift()!;
    const node = current.node;
    const startedAt = Date.now();

    try {
      await logStep(input.runId, node, "started", { input: node.config });

      if (node.type === "condition") {
        const result = await evaluateCondition(node, ctx);
        const branch = getConditionBranch(result);
        await logStep(input.runId, node, "completed", {
          output: { result, branch },
          durationMs: Date.now() - startedAt,
        });
        if (!result && node.kind === "filter") continue;
        const next = selectNextNodes(input.definition, node.id, branch);
        queue.push(...next.map((n) => ({ node: n })));
        continue;
      }

      if (node.type === "action") {
        const output = await executeAction(node, ctx);
        await logStep(input.runId, node, "completed", {
          output,
          durationMs: Date.now() - startedAt,
        });
        const next = selectNextNodes(input.definition, node.id);
        queue.push(...next.map((n) => ({ node: n })));
        continue;
      }

      await logStep(input.runId, node, "skipped", { output: { reason: "unsupported node type" } });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Step failed";
      await logStep(input.runId, node, "failed", {
        error: message,
        durationMs: Date.now() - startedAt,
      });
      throw err;
    }
  }

  await prisma.workflowRun.update({
    where: { id: input.runId },
    data: {
      variables: ctx.variables as Prisma.InputJsonValue,
      logs: ctx.logs as unknown as Prisma.InputJsonValue,
    },
  });

  return { variables: ctx.variables, logs: ctx.logs };
}

async function logStep(
  runId: string,
  node: WorkflowNode,
  status: ExecutionLogEntry["status"],
  extra?: Partial<ExecutionLogEntry> & { durationMs?: number },
) {
  const entry: ExecutionLogEntry = {
    nodeId: node.id,
    nodeType: node.type,
    nodeKind: node.kind,
    status,
    timestamp: new Date().toISOString(),
    ...extra,
  };

  const run = await prisma.workflowRun.findUnique({ where: { id: runId }, select: { logs: true } });
  const logs = [...(((run?.logs as unknown) as ExecutionLogEntry[]) ?? []), entry];

  await prisma.$transaction([
    prisma.workflowExecutionLog.create({
      data: {
        runId,
        nodeId: node.id,
        nodeType: node.type,
        nodeKind: node.kind,
        status,
        input: extra?.input as Prisma.InputJsonValue,
        output: extra?.output as Prisma.InputJsonValue,
        error: extra?.error,
        durationMs: extra?.durationMs,
        completedAt: status !== "started" ? new Date() : undefined,
      },
    }),
    prisma.workflowRun.update({
      where: { id: runId },
      data: { logs: logs as unknown as Prisma.InputJsonValue },
    }),
  ]);
}
