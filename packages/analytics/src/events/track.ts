import { prisma, type Prisma } from "@limbu/db";

export async function trackProductEvent(input: {
  eventName: string;
  userId?: string;
  organizationId?: string;
  workspaceId?: string;
  properties?: Record<string, unknown>;
}) {
  await prisma.productEvent.create({
    data: {
      eventName: input.eventName,
      userId: input.userId,
      organizationId: input.organizationId,
      workspaceId: input.workspaceId,
      properties: (input.properties ?? {}) as Prisma.InputJsonValue,
    },
  });
}

export async function trackProductEventsBatch(
  events: Array<{
    eventName: string;
    userId?: string;
    organizationId?: string;
    workspaceId?: string;
    properties?: Record<string, unknown>;
  }>,
) {
  if (events.length === 0) return;
  await prisma.productEvent.createMany({
    data: events.map((e) => ({
      eventName: e.eventName,
      userId: e.userId,
      organizationId: e.organizationId,
      workspaceId: e.workspaceId,
      properties: (e.properties ?? {}) as Prisma.InputJsonValue,
    })),
  });
}
