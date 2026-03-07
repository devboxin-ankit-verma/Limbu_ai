/**
 * Notice repository - database access for notices (broadcast messages).
 */

import { PrismaClient } from '@prisma/client';

export interface NoticeRecord {
  id: number;
  title: string;
  body: string;
  type: string;
  target: string;
  isActive: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListNoticesOptions {
  skip: number;
  limit: number;
  target?: string;
  isActive?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
}

export class NoticeRepository {
  constructor(private readonly db: PrismaClient) {}

  async findMany(options: ListNoticesOptions) {
    const { skip, limit, target, isActive, sort = 'createdAt', order = 'desc' } = options;
    const where: Record<string, unknown> = {};
    if (target) where.target = target;
    if (typeof isActive === 'boolean') where.isActive = isActive;
    const [data, total] = await Promise.all([
      this.db.notice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order }
      }),
      this.db.notice.count({ where })
    ]);
    return { data: data as unknown as NoticeRecord[], total };
  }

  async create(data: { title: string; body: string; type?: string; target?: string }) {
    const row = await this.db.notice.create({
      data: {
        title: data.title,
        body: data.body,
        type: data.type ?? 'info',
        target: data.target ?? 'all',
        isActive: true,
        publishedAt: new Date()
      }
    });
    return row as unknown as NoticeRecord;
  }
}
