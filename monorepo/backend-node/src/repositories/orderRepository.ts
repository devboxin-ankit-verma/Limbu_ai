/**
 * Order repository - database access for orders.
 */

import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface OrderRecord {
  id: number;
  userId: number;
  symbolId: number;
  side: string;
  type: string;
  quantity: Decimal;
  price: Decimal | null;
  status: string;
  filledQty: Decimal;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListOrdersOptions {
  skip: number;
  limit: number;
  userId?: number;
  symbolId?: number;
  status?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface ListOrdersResult {
  data: OrderRecord[];
  total: number;
}

export class OrderRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: number): Promise<OrderRecord | null> {
    const row = await this.db.order.findUnique({
      where: { id },
      include: { symbol: true, user: true }
    });
    return row as unknown as OrderRecord | null;
  }

  async findMany(options: ListOrdersOptions): Promise<ListOrdersResult> {
    const { skip, limit, userId, symbolId, status, sort = 'createdAt', order = 'desc' } = options;
    const where: Record<string, unknown> = {};
    if (userId != null) where.userId = userId;
    if (symbolId != null) where.symbolId = symbolId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.db.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        include: { symbol: true, user: { select: { id: true, email: true, username: true } } }
      }),
      this.db.order.count({ where })
    ]);
    return { data: data as unknown as OrderRecord[], total };
  }

  async create(data: {
    userId: number;
    symbolId: number;
    side: string;
    type: string;
    quantity: Decimal | number;
    price?: Decimal | number | null;
  }): Promise<OrderRecord> {
    const row = await this.db.order.create({
      data: {
        userId: data.userId,
        symbolId: data.symbolId,
        side: data.side,
        type: data.type,
        quantity: data.quantity,
        price: data.price ?? null,
        status: 'pending',
        filledQty: 0
      }
    });
    return row as unknown as OrderRecord;
  }

  async updateStatus(id: number, status: string, filledQty?: Decimal | number): Promise<OrderRecord | null> {
    try {
      const updateData: Record<string, unknown> = { status };
      if (filledQty !== undefined) updateData.filledQty = filledQty;
      const row = await this.db.order.update({
        where: { id },
        data: updateData
      });
      return row as unknown as OrderRecord;
    } catch {
      return null;
    }
  }
}
