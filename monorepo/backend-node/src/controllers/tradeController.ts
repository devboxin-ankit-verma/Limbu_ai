/**
 * Trade controller - request/response for trades.
 */

import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendList, sendError } from '../utils/response';
import { StatusCodes } from '../constants/api';
import { TradeService } from '../services/tradeService';

function getTradeService(req: Request): TradeService {
  return req.app.get('tradeService');
}

function parseTradeRecord(trade: unknown): Record<string, unknown> {
  const t = trade as Record<string, unknown>;
  return {
    id: t.id,
    orderId: t.orderId,
    userId: t.userId,
    symbolId: t.symbolId,
    side: t.side,
    quantity: t.quantity,
    price: t.price,
    brokerage: t.brokerage,
    executedAt: t.executedAt,
    symbol: (t as { symbol?: unknown }).symbol,
    user: (t as { user?: unknown }).user
  };
}

export async function listTrades(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;
    const userId = req.query.userId ? parseInt(req.query.userId as string, 10) : undefined;
    const orderId = req.query.orderId ? parseInt(req.query.orderId as string, 10) : undefined;
    const symbolId = req.query.symbolId ? parseInt(req.query.symbolId as string, 10) : undefined;
    const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined;
    const dateTo = req.query.dateTo ? new Date(req.query.dateTo as string) : undefined;
    const sort = (req.query.sort as string) || 'executedAt';
    const order = (req.query.order as string)?.toLowerCase() === 'asc' ? 'asc' : 'desc';

    const tradeService = getTradeService(req);
    const { data, total } = await tradeService.list({
      skip,
      limit,
      userId: userId !== undefined && !isNaN(userId) ? userId : undefined,
      orderId: orderId !== undefined && !isNaN(orderId) ? orderId : undefined,
      symbolId: symbolId !== undefined && !isNaN(symbolId) ? symbolId : undefined,
      dateFrom: dateFrom && !isNaN(dateFrom.getTime()) ? dateFrom : undefined,
      dateTo: dateTo && !isNaN(dateTo.getTime()) ? dateTo : undefined,
      sort,
      order
    });
    sendList(res, data.map(parseTradeRecord), { page, limit, total });
  } catch (err) {
    next(err);
  }
}
