/**
 * Notification repository - database access for user notifications.
 */

import { PrismaClient } from '@prisma/client';

export interface NotificationRecord {
  id: number;
  userId: number;
  title: string;
  body: string;
  read: boolean;
  createdAt: Date;
}

export class NotificationRepository {
  constructor(private readonly db: PrismaClient) {}

  async findManyByUserId(userId: number, options: { skip: number; limit: number; read?: boolean }) {
    const where: Record<string, unknown> = { userId };
    if (typeof options.read === 'boolean') where.read = options.read;
    const [data, total] = await Promise.all([
      this.db.notification.findMany({
        where,
        skip: options.skip,
        take: options.limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.db.notification.count({ where })
    ]);
    return { data: data as unknown as NotificationRecord[], total };
  }

  async create(data: { userId: number; title: string; body: string }) {
    const row = await this.db.notification.create({
      data: { userId: data.userId, title: data.title, body: data.body }
    });
    return row as unknown as NotificationRecord;
  }

  async markRead(id: number, userId: number): Promise<boolean> {
    const updated = await this.db.notification.updateMany({
      where: { id, userId },
      data: { read: true }
    });
    return updated.count > 0;
  }
}
