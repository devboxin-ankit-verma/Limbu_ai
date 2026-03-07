/**
 * Market controller - request/response for markets list.
 */

import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendList } from '../utils/response';
import { MarketRepository } from '../repositories/marketRepository';

function getMarketRepository(req: Request): MarketRepository {
  return req.app.get('marketRepository');
}

/**
 * List all active markets (for tabs/filters).
 */
export async function listMarkets(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const repo = getMarketRepository(req);
    const { data, total } = await repo.findMany({ isActive: true, limit: 50 });
    sendList(res, data, { page: 1, limit: data.length, total });
  } catch (err) {
    next(err);
  }
}
