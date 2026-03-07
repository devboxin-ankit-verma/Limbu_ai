/**
 * Report service - aggregates for turnover, PnL, brokerage.
 * Optionally uses Redis to cache heavy aggregates.
 */

import { PrismaClient } from '@prisma/client';
import { cacheGet, cacheSet, cacheKeys } from '../lib/redis';

const REPORT_CACHE_TTL = 60;

export interface TurnoverRow {
  date?: string;
  symbolId?: number;
  userId?: number;
  buyTurnover: number;
  sellTurnover: number;
  totalTurnover: number;
}

export interface ProfitLossRow {
  userId?: number;
  symbolId?: number;
  realizedPnl: number;
  totalBrokerage: number;
}

export class ReportService {
  constructor(private readonly db: PrismaClient) {}

  async getTurnover(options: {
    dateFrom: Date;
    dateTo: Date;
    userId?: number;
    groupBy?: 'day' | 'symbol' | 'user';
  }): Promise<TurnoverRow[]> {
    const { dateFrom, dateTo, userId, groupBy = 'day' } = options;
    const cacheKey = cacheKeys.reportTurnover(
      dateFrom.toISOString(),
      dateTo.toISOString(),
      userId
    );
    const cached = await cacheGet<TurnoverRow[]>(cacheKey);
    if (cached) return cached;
    const where: Record<string, unknown> = {
      executedAt: { gte: dateFrom, lte: dateTo }
    };
    if (userId != null) where.userId = userId;

    const trades = await this.db.trade.findMany({
      where,
      select: { userId: true, symbolId: true, side: true, quantity: true, price: true, executedAt: true }
    });

    const map = new Map<string, { buy: number; sell: number }>();
    for (const t of trades) {
      const q = Number(t.quantity);
      const p = Number(t.price);
      const val = q * p;
      let key: string;
      if (groupBy === 'day') key = (t.executedAt as Date).toISOString().slice(0, 10);
      else if (groupBy === 'symbol') key = `s${t.symbolId}`;
      else key = `u${t.userId}`;
      const cur = map.get(key) ?? { buy: 0, sell: 0 };
      if (t.side === 'buy') cur.buy += val;
      else cur.sell += val;
      map.set(key, cur);
    }
    const result = Array.from(map.entries()).map(([k, v]) => ({
      ...(groupBy === 'day' ? { date: k } : groupBy === 'symbol' ? { symbolId: parseInt(k.slice(1), 10) } : { userId: parseInt(k.slice(1), 10) }),
      buyTurnover: v.buy,
      sellTurnover: v.sell,
      totalTurnover: v.buy + v.sell
    }));
    await cacheSet(cacheKey, result, REPORT_CACHE_TTL);
    return result;
  }

  async getProfitLoss(options: { dateFrom: Date; dateTo: Date; userId?: number }): Promise<ProfitLossRow[]> {
    const where: Record<string, unknown> = {
      executedAt: { gte: options.dateFrom, lte: options.dateTo }
    };
    if (options.userId != null) where.userId = options.userId;
    const trades = await this.db.trade.findMany({
      where,
      select: { userId: true, symbolId: true, side: true, quantity: true, price: true, brokerage: true }
    });
    const map = new Map<string, { pnl: number; brokerage: number }>();
    for (const t of trades) {
      const key = `${t.userId}-${t.symbolId}`;
      const cur = map.get(key) ?? { pnl: 0, brokerage: 0 };
      const val = Number(t.quantity) * Number(t.price);
      cur.brokerage += Number(t.brokerage);
      if (t.side === 'sell') cur.pnl += val;
      else cur.pnl -= val;
      map.set(key, cur);
    }
    return Array.from(map.entries()).map(([k, v]) => {
      const [uid, sid] = k.split('-').map(Number);
      return { userId: uid, symbolId: sid, realizedPnl: v.pnl, totalBrokerage: v.brokerage };
    });
  }

  async getBrokerage(options: { dateFrom: Date; dateTo: Date; userId?: number }): Promise<{ totalBrokerage: number; count: number }> {
    const cacheKey = cacheKeys.reportBrokerage(
      options.dateFrom.toISOString(),
      options.dateTo.toISOString(),
      options.userId
    );
    const cached = await cacheGet<{ totalBrokerage: number; count: number }>(cacheKey);
    if (cached) return cached;
    const where: Record<string, unknown> = {
      executedAt: { gte: options.dateFrom, lte: options.dateTo }
    };
    if (options.userId != null) where.userId = options.userId;
    const agg = await this.db.trade.aggregate({
      where,
      _sum: { brokerage: true },
      _count: true
    });
    const result = {
      totalBrokerage: Number(agg._sum.brokerage ?? 0),
      count: agg._count
    };
    await cacheSet(cacheKey, result, REPORT_CACHE_TTL);
    return result;
  }
}
