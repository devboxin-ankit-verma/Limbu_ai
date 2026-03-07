/**
 * Trade repository - database access for executed trades.
 */

import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface TradeRecord {
  id: number;
  orderId: number;
  userId: number;
  symbolId: number;
  side: string;
  quantity: Decimal;
  price: Decimal;
  brokerage: Decimal;
  executedAt: Date;
}

export interface ListTradesOptions {
  skip: number;
  limit: number;
  userId?: number;
  orderId?: number;
  symbolId?: number;
  dateFrom?: Date;
  dateTo?: Date;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface ListTradesResult {
  data: TradeRecord[];
  total: number;
}

export class TradeRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(data: {
    orderId: number;
    userId: number;
    symbolId: number;
    side: string;
    quantity: Decimal | number;
    price: Decimal | number;
    brokerage?: Decimal | number;
  }): Promise<TradeRecord> {
    const row = await this.db.trade.create({
      data: {
        orderId: data.orderId,
        userId: data.userId,
        symbolId: data.symbolId,
        side: data.side,
        quantity: data.quantity,
        price: data.price,
        brokerage: data.brokerage ?? 0
      }
    });
    return row as unknown as TradeRecord;
  }

  async findMany(options: ListTradesOptions): Promise<ListTradesResult> {
    const {
      skip,
      limit,
      userId,
      orderId,
      symbolId,
      dateFrom,
      dateTo,
      sort = 'executedAt',
      order = 'desc'
    } = options;
    const where: Record<string, unknown> = {};
    if (userId != null) where.userId = userId;
    if (orderId != null) where.orderId = orderId;
    if (symbolId != null) where.symbolId = symbolId;
    if (dateFrom || dateTo) {
      where.executedAt = {};
      if (dateFrom) (where.executedAt as Record<string, Date>).gte = dateFrom;
      if (dateTo) (where.executedAt as Record<string, Date>).lte = dateTo;
    }

    const [data, total] = await Promise.all([
      this.db.trade.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        include: { symbol: true, user: { select: { id: true, email: true, username: true } } }
      }),
      this.db.trade.count({ where })
    ]);
    return { data: data as unknown as TradeRecord[], total };
  }
}
