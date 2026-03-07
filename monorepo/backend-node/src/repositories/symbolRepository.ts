/**
 * Symbol repository - database access for symbols (instruments).
 */

import { PrismaClient } from '@prisma/client';

export interface SymbolRecord {
  id: number;
  code: string;
  name: string;
  marketId: number;
  lotSize: unknown;
  tickSize: unknown;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListSymbolsOptions {
  skip: number;
  limit: number;
  marketId?: number;
  isActive?: boolean;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  withQuotes?: boolean;
}

export interface QuoteRecord {
  ask: number;
  bid: number;
  ltp: number;
  change: number;
  high: number;
  low: number;
  updatedAt: Date;
}

export type SymbolWithQuoteRecord = SymbolRecord & { quote: QuoteRecord | null };

export class SymbolRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: number): Promise<SymbolRecord | null> {
    const row = await this.db.symbol.findUnique({
      where: { id },
      include: { market: true }
    });
    return row as unknown as SymbolRecord | null;
  }

  async findMany(options: ListSymbolsOptions): Promise<{ data: SymbolRecord[] | SymbolWithQuoteRecord[]; total: number }> {
    const { skip, limit, marketId, isActive, search, sort = 'code', order = 'asc', withQuotes = false } = options;
    const where: Record<string, unknown> = {};
    if (marketId != null) where.marketId = marketId;
    if (typeof isActive === 'boolean') where.isActive = isActive;
    if (search && search.trim()) {
      where.OR = [
        { code: { contains: search.trim() } },
        { name: { contains: search.trim() } }
      ];
    }
    const include = withQuotes ? { market: true, quotes: true } : { market: true };
    const [rows, total] = await Promise.all([
      this.db.symbol.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        include
      }),
      this.db.symbol.count({ where })
    ]);
    if (!withQuotes) {
      return { data: rows as unknown as SymbolRecord[], total };
    }
    const data = (rows as unknown as Array<SymbolRecord & { quotes?: Array<{ ask: unknown; bid: unknown; ltp: unknown; change: unknown; high: unknown; low: unknown; updatedAt: Date }> }>).map((row) => {
      const q = row.quotes && row.quotes[0];
      const { quotes: _q, ...sym } = row;
      const num = (v: unknown) => (typeof v === 'number' ? v : Number(v));
      return {
        ...sym,
        quote: q
          ? {
              ask: num(q.ask),
              bid: num(q.bid),
              ltp: num(q.ltp),
              change: num(q.change),
              high: num(q.high),
              low: num(q.low),
              updatedAt: q.updatedAt
            }
          : null
      } as SymbolWithQuoteRecord;
    });
    return { data, total };
  }

  async create(data: {
    code: string;
    name: string;
    marketId: number;
    lotSize: number;
    tickSize: number;
    isActive?: boolean;
  }): Promise<SymbolRecord> {
    const row = await this.db.symbol.create({
      data: {
        code: data.code,
        name: data.name,
        marketId: data.marketId,
        lotSize: data.lotSize,
        tickSize: data.tickSize,
        isActive: data.isActive ?? true
      }
    });
    return row as unknown as SymbolRecord;
  }

  async update(id: number, data: { code?: string; name?: string; isActive?: boolean }): Promise<SymbolRecord | null> {
    try {
      const row = await this.db.symbol.update({
        where: { id },
        data
      });
      return row as unknown as SymbolRecord;
    } catch {
      return null;
    }
  }
}
