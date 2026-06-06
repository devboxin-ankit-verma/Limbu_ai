import { prisma, type Prisma } from "@limbu/db";

export async function logToolExecution(input: {
  organizationId: string;
  userId: string;
  workspaceId: string;
  threadId?: string;
  toolName: string;
  args: Record<string, unknown>;
  result?: unknown;
  error?: string;
  durationMs: number;
  success: boolean;
}) {
  await prisma.auditLog.create({
    data: {
      organizationId: input.organizationId,
      actorId: input.userId,
      action: input.success ? "ai.tool.executed" : "ai.tool.failed",
      resourceType: "ai_tool",
      resourceId: input.toolName,
      metadata: {
        workspaceId: input.workspaceId,
        threadId: input.threadId,
        args: input.args,
        result: input.result,
        error: input.error,
        durationMs: input.durationMs,
      } as Prisma.InputJsonValue,
    },
  });
}
