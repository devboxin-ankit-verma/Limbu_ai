import cronParser from "cron-parser";
import { prisma, WorkflowStatus, WorkflowTriggerType } from "@limbu/db";
import { enqueueWorkflowRun } from "../queue/processor";

export async function scheduleDueWorkflows() {
  const workflows = await prisma.workflow.findMany({
    where: {
      status: WorkflowStatus.active,
      triggerType: WorkflowTriggerType.scheduled,
    },
    select: {
      id: true,
      organizationId: true,
      workspaceId: true,
      createdById: true,
      triggerConfig: true,
    },
  });

  const enqueued: string[] = [];

  for (const workflow of workflows) {
    const config = workflow.triggerConfig as Record<string, unknown>;
    const cron = String(config.cron ?? "0 * * * *");
    const lastRunAt = config.lastRunAt ? new Date(String(config.lastRunAt)) : null;

    try {
      const interval = cronParser.parseExpression(cron, { currentDate: new Date() });
      const prev = interval.prev();
      if (lastRunAt && prev.getTime() <= lastRunAt.getTime()) continue;

      const userId = workflow.createdById;
      if (!userId) continue;

      await enqueueWorkflowRun({
        workflowId: workflow.id,
        userId,
        workspaceId: workflow.workspaceId,
        organizationId: workflow.organizationId,
        triggerEvent: { type: "scheduled", cron },
        idempotencyKey: `${workflow.id}:${prev.toISOString()}`,
        scheduledAt: new Date(),
      });

      await prisma.workflow.update({
        where: { id: workflow.id },
        data: {
          triggerConfig: {
            ...config,
            lastRunAt: new Date().toISOString(),
          },
        },
      });

      enqueued.push(workflow.id);
    } catch {
      // invalid cron — skip
    }
  }

  return enqueued;
}

export async function runSchedulerTick() {
  const scheduled = await scheduleDueWorkflows();
  return { scheduled, processed: 0 };
}
