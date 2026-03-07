/**
 * Market repository - database access for markets.
 */

import { PrismaClient } from '@prisma/client';

export interface MarketRecord {
  id: number;
  name: string;
  code: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class MarketRepository {
  constructor(private readonly db: PrismaClient) {}

  async findMany(options: { skip?: number; limit?: number; isActive?: boolean } = {}) {
    const where: Record<string, unknown> = {};
    if (typeof options.isActive === 'boolean') where.isActive = options.isActive;
    const [data, total] = await Promise.all([
      this.db.market.findMany({
        where,
        skip: options.skip ?? 0,
        take: options.limit ?? 100,
        orderBy: { code: 'asc' }
      }),
      this.db.market.count({ where })
    ]);
    return { data: data as unknown as MarketRecord[], total };
  }

  async findById(id: number): Promise<MarketRecord | null> {
    const row = await this.db.market.findUnique({ where: { id } });
    return row as unknown as MarketRecord | null;
  }
}
