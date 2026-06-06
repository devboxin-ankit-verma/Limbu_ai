import { prisma, type Prisma } from "@limbu/db";
import type { NotificationPayload, Paginated, NotificationRow } from "../types";
import { NotificationNotFoundError, NotificationForbiddenError } from "../errors";

export async function listNotifications(input: {
  userId: string;
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}): Promise<Paginated<NotificationRow>> {
  const page = input.page ?? 1;
  const limit = input.limit ?? 20;
  const skip = (page - 1) * limit;

  const where = {
    userId: input.userId,
    ...(input.unreadOnly ? { readAt: null } : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where }),
  ]);

  return {
    items: rows.map(mapNotification),
    total,
    page,
    limit,
  };
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, readAt: null } });
}

export async function markNotificationRead(notificationId: string, userId: string) {
  const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
  if (!notification) throw new NotificationNotFoundError("Notification not found");
  if (notification.userId !== userId) throw new NotificationForbiddenError();

  return prisma.notification.update({
    where: { id: notificationId },
    data: { readAt: new Date() },
  });
}

export async function markAllNotificationsRead(userId: string) {
  const result = await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
  return { updated: result.count };
}

export async function createInAppNotification(input: {
  userId: string;
  type: string;
  eventType?: string;
  payload: NotificationPayload;
}) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      eventType: input.eventType,
      payload: input.payload as Prisma.InputJsonValue,
    },
  });
}

function mapNotification(row: {
  id: string;
  type: string;
  eventType: string | null;
  payload: unknown;
  readAt: Date | null;
  createdAt: Date;
}): NotificationRow {
  return {
    id: row.id,
    type: row.type,
    eventType: row.eventType,
    payload: row.payload as NotificationPayload,
    readAt: row.readAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}
