import {
  EmailDeliveryStatus,
  NotificationChannel,
  NotificationDeliveryStatus,
  prisma,
  type Prisma,
} from "@limbu/db";

export async function createDelivery(input: {
  userId: string;
  channel: NotificationChannel;
  notificationId?: string;
  templateKey?: string;
  status?: NotificationDeliveryStatus;
  error?: string;
  providerId?: string;
  metadata?: Record<string, unknown>;
}) {
  return prisma.notificationDelivery.create({
    data: {
      userId: input.userId,
      channel: input.channel,
      notificationId: input.notificationId,
      templateKey: input.templateKey,
      status: input.status ?? NotificationDeliveryStatus.queued,
      error: input.error,
      providerId: input.providerId,
      metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
      sentAt:
        input.status === NotificationDeliveryStatus.delivered ||
        input.status === NotificationDeliveryStatus.sent
          ? new Date()
          : undefined,
    },
  });
}

export async function updateDeliveryStatus(
  deliveryId: string,
  status: NotificationDeliveryStatus,
  input?: { error?: string; providerId?: string },
) {
  return prisma.notificationDelivery.update({
    where: { id: deliveryId },
    data: {
      status,
      error: input?.error,
      providerId: input?.providerId,
      sentAt:
        status === NotificationDeliveryStatus.sent ||
        status === NotificationDeliveryStatus.delivered
          ? new Date()
          : undefined,
    },
  });
}

export async function logEmailDelivery(input: {
  userId: string;
  template: string;
  status: EmailDeliveryStatus;
  providerId?: string;
}) {
  return prisma.emailDelivery.create({
    data: {
      userId: input.userId,
      template: input.template,
      status: input.status,
      providerId: input.providerId,
    },
  });
}

export async function listDeliveries(input: {
  userId: string;
  page?: number;
  limit?: number;
}) {
  const page = input.page ?? 1;
  const limit = input.limit ?? 20;
  const skip = (page - 1) * limit;

  const [rows, total] = await Promise.all([
    prisma.notificationDelivery.findMany({
      where: { userId: input.userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.notificationDelivery.count({ where: { userId: input.userId } }),
  ]);

  return {
    items: rows.map((r) => ({
      id: r.id,
      channel: r.channel,
      templateKey: r.templateKey,
      status: r.status,
      error: r.error,
      createdAt: r.createdAt.toISOString(),
      sentAt: r.sentAt?.toISOString() ?? null,
    })),
    total,
    page,
    limit,
  };
}
