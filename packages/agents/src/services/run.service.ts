import {
  AgentRunStatus,
  prisma,
  type Prisma,
} from "@limbu/db";
import { requireAgentAccess, requireAgentRunAccess } from "../access";
import { AGENT_CONFIG } from "../config";
import { AgentValidationError } from "../errors";
import { registerAgentTools } from "../tools/register";
import { listAgents } from "../registry";
import { planTaskRoute, runSupervisedTask } from "../supervisor/supervisor";
import { startAgentRunSchema, listAgentRunsSchema } from "../validators";
import type {
  AgentExecutionContext,
  AgentRunRequest,
  AgentRunResult,
  AgentRunStep,
  BuiltinAgentKey,
} from "../types";

registerAgentTools();

export function getAgentRegistry() {
  return listAgents();
}

export async function startAgentRun(
  ctx: AgentExecutionContext,
  request: AgentRunRequest,
): Promise<AgentRunResult> {
  await requireAgentAccess(ctx, { write: true });

  const { assertAgentRunQuota, assertFeature, trackUsage } = await import("@limbu/billing");
  const { UsageMetricCategory } = await import("@limbu/db");
  await assertFeature(ctx.organizationId, "ai_agents");
  await assertAgentRunQuota(ctx.organizationId);

  const parsed = startAgentRunSchema.safeParse(request);
  if (!parsed.success) {
    throw new AgentValidationError(
      "Invalid agent run request",
      parsed.error.flatten().fieldErrors as Record<string, string[]>,
    );
  }

  const route = planTaskRoute(parsed.data.task, parsed.data.agentKey);
  const steps: AgentRunStep[] = [];

  const run = await prisma.agentRun.create({
    data: {
      userId: ctx.userId,
      workspaceId: ctx.workspaceId,
      organizationId: ctx.organizationId,
      task: parsed.data.task,
      status: AgentRunStatus.running,
      currentAgentKey: route.primary,
      routing: route as unknown as Prisma.InputJsonValue,
      input: (parsed.data.input ?? {}) as Prisma.InputJsonValue,
      steps: steps as unknown as Prisma.InputJsonValue,
    },
  });

  await trackUsage({
    organizationId: ctx.organizationId,
    category: UsageMetricCategory.agent_runs,
    quantity: 1,
    referenceId: run.id,
  });

  const { trackProductEvent, PRODUCT_EVENTS } = await import("@limbu/analytics");
  void trackProductEvent({
    eventName: PRODUCT_EVENTS.AGENT_RUN,
    userId: ctx.userId,
    organizationId: ctx.organizationId,
    workspaceId: ctx.workspaceId,
    properties: { runId: run.id, agentKey: route.primary },
  }).catch(() => {});

  try {
    const result = await runSupervisedTask({
      runId: run.id,
      task: parsed.data.task,
      context: ctx,
      route,
      forcedAgent: parsed.data.agentKey,
    });

    const totalCredits = result.usage.reduce((sum, u) => sum + u.credits, 0);

    await prisma.agentRun.update({
      where: { id: run.id },
      data: {
        status: AgentRunStatus.completed,
        currentAgentKey: route.primary,
        steps: result.steps as unknown as Prisma.InputJsonValue,
        output: {
          content: result.content,
          routedTo: result.routedTo,
          supportingAgents: result.supportingAgents,
        } as Prisma.InputJsonValue,
        creditsUsed: totalCredits,
        completedAt: new Date(),
      },
    });

    return {
      runId: run.id,
      status: AgentRunStatus.completed,
      routedTo: result.routedTo,
      supportingAgents: result.supportingAgents,
      content: result.content,
      usage: result.usage,
      steps: result.steps,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Agent run failed";
    await prisma.agentRun.update({
      where: { id: run.id },
      data: {
        status: AgentRunStatus.failed,
        output: { error: message } as Prisma.InputJsonValue,
        completedAt: new Date(),
      },
    });
    throw err;
  }
}

export async function getAgentRun(runId: string, ctx: AgentExecutionContext) {
  const run = await requireAgentRunAccess(runId, ctx);
  const messages = await prisma.agentRunMessage.findMany({
    where: { runId },
    orderBy: { createdAt: "asc" },
  });
  const memory = await prisma.agentMemoryEntry.findMany({
    where: { runId },
    orderBy: { updatedAt: "desc" },
  });

  return {
    run,
    messages,
    memory,
  };
}

export async function listAgentRuns(
  ctx: AgentExecutionContext,
  query?: { cursor?: string; limit?: number },
) {
  await requireAgentAccess(ctx);

  const parsed = listAgentRunsSchema.safeParse(query ?? {});
  if (!parsed.success) throw new AgentValidationError("Invalid query");

  const limit = parsed.data.limit ?? 20;

  const runs = await prisma.agentRun.findMany({
    where: {
      workspaceId: ctx.workspaceId,
      organizationId: ctx.organizationId,
      userId: ctx.userId,
    },
    orderBy: [{ startedAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    ...(parsed.data.cursor ? { cursor: { id: parsed.data.cursor }, skip: 1 } : {}),
  });

  const hasMore = runs.length > limit;
  const page = hasMore ? runs.slice(0, limit) : runs;

  return {
    runs: page,
    nextCursor: hasMore ? page[page.length - 1]?.id ?? null : null,
    hasMore,
  };
}

export async function routeTaskPreview(task: string, agentKey?: BuiltinAgentKey) {
  return planTaskRoute(task, agentKey);
}

export { AGENT_CONFIG };
