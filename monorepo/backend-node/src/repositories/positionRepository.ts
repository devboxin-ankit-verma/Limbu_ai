/**
 * Position repository - database access for open/closed positions.
 */

import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface PositionRecord {
  id: number;
  userId: number;
  symbolId: number;
  side: string;
  quantity: Decimal;
  avgPrice: Decimal;
  currentPrice: Decimal | null;
  openedAt: Date;
  closedAt: Date | null;
}

export interface ListPositionsOptions {
  skip: number;
  limit: number;
  userId?: number;
  symbolId?: number;
  openOnly?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
}

export class PositionRepository {
  constructor(private readonly db: PrismaClient) {}

  async findOpenByUserSymbolSide(userId: number, symbolId: number, side: string): Promise<PositionRecord | null> {
    const row = await this.db.position.findFirst({
      where: { userId, symbolId, side, closedAt: null }
    });
    return row as unknown as PositionRecord | null;
  }

  async findById(id: number): Promise<PositionRecord | null> {
    const row = await this.db.position.findUnique({
      where: { id },
      include: { symbol: true, user: true }
    });
    return row as unknown as PositionRecord | null;
  }

  async findMany(options: ListPositionsOptions): Promise<{ data: PositionRecord[]; total: number }> {
    const { skip, limit, userId, symbolId, openOnly = true, sort = 'openedAt', order = 'desc' } = options;
    const where: Record<string, unknown> = {};
    if (userId != null) where.userId = userId;
    if (symbolId != null) where.symbolId = symbolId;
    if (openOnly) where.closedAt = null;

    const [data, total] = await Promise.all([
      this.db.position.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        include: { symbol: true }
      }),
      this.db.position.count({ where })
    ]);
    return { data: data as unknown as PositionRecord[], total };
  }

  async create(data: {
    userId: number;
    symbolId: number;
    side: string;
    quantity: number;
    avgPrice: number;
  }): Promise<PositionRecord> {
    const row = await this.db.position.create({
      data: {
        userId: data.userId,
        symbolId: data.symbolId,
        side: data.side,
        quantity: data.quantity,
        avgPrice: data.avgPrice
      }
    });
    return row as unknown as PositionRecord;
  }

  async updateQuantityAndPrice(
    id: number,
    quantity: number,
    avgPrice: number,
    currentPrice?: number | null
  ): Promise<PositionRecord | null> {
    try {
      const row = await this.db.position.update({
        where: { id },
        data: { quantity, avgPrice, currentPrice: currentPrice ?? undefined }
      });
      return row as unknown as PositionRecord;
    } catch {
      return null;
    }
  }

  async close(id: number): Promise<PositionRecord | null> {
    try {
      const row = await this.db.position.update({
        where: { id },
        data: { closedAt: new Date() }
      });
      return row as unknown as PositionRecord;
    } catch {
      return null;
    }
  }
}
