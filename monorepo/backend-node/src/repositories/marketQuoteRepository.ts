/**
 * Market quote repository - database access for symbol quotes (ask, bid, ltp, etc.).
 */

import { PrismaClient } from '@prisma/client';

export interface MarketQuoteRecord {
  id: number;
  symbolId: number;
  ask: unknown;
  bid: unknown;
  ltp: unknown;
  change: unknown;
  high: unknown;
  low: unknown;
  updatedAt: Date;
}

export class MarketQuoteRepository {
  constructor(private readonly db: PrismaClient) {}

  async upsertForSymbol(symbolId: number, data: {
    ask: number;
    bid: number;
    ltp: number;
    change: number;
    high: number;
    low: number;
  }): Promise<MarketQuoteRecord> {
    const row = await this.db.marketQuote.upsert({
      where: { symbolId },
      create: {
        symbolId,
        ask: data.ask,
        bid: data.bid,
        ltp: data.ltp,
        change: data.change,
        high: data.high,
        low: data.low
      },
      update: {
        ask: data.ask,
        bid: data.bid,
        ltp: data.ltp,
        change: data.change,
        high: data.high,
        low: data.low
      }
    });
    return row as unknown as MarketQuoteRecord;
  }
}
