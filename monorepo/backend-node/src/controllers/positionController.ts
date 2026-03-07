/**
 * Position controller - request/response for positions.
 */

import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendList, sendError } from '../utils/response';
import { StatusCodes } from '../constants/api';
import { NotFoundError, ValidationError } from '../utils/errors';
import { PositionService } from '../services/positionService';

function getPositionService(req: Request): PositionService {
  return req.app.get('positionService');
}

function parsePositionRecord(pos: unknown): Record<string, unknown> {
  const p = pos as Record<string, unknown>;
  return {
    id: p.id,
    userId: p.userId,
    symbolId: p.symbolId,
    side: p.side,
    quantity: p.quantity,
    avgPrice: p.avgPrice,
    currentPrice: p.currentPrice,
    openedAt: p.openedAt,
    closedAt: p.closedAt,
    symbol: (p as { symbol?: unknown }).symbol
  };
}

export async function listPositions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;
    const userId = req.query.userId ? parseInt(req.query.userId as string, 10) : undefined;
    const symbolId = req.query.symbolId ? parseInt(req.query.symbolId as string, 10) : undefined;
    const openOnly = req.query.status !== 'closed';
    const sort = (req.query.sort as string) || 'openedAt';
    const order = (req.query.order as string)?.toLowerCase() === 'asc' ? 'asc' : 'desc';

    const positionService = getPositionService(req);
    const { data, total } = await positionService.list({
      skip,
      limit,
      userId: userId !== undefined && !isNaN(userId) ? userId : undefined,
      symbolId: symbolId !== undefined && !isNaN(symbolId) ? symbolId : undefined,
      openOnly,
      sort,
      order
    });
    sendList(res, data.map(parsePositionRecord), { page, limit, total });
  } catch (err) {
    next(err);
  }
}

export async function getPosition(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      sendError(res, 'Invalid position id', StatusCodes.BAD_REQUEST, 'VALIDATION_ERROR');
      return;
    }
    const positionService = getPositionService(req);
    const pos = await positionService.getById(id);
    sendSuccess(res, parsePositionRecord(pos));
  } catch (err) {
    if (err instanceof NotFoundError) {
      sendError(res, err.message, StatusCodes.NOT_FOUND, err.code);
      return;
    }
    next(err);
  }
}

export async function closePosition(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      sendError(res, 'Invalid position id', StatusCodes.BAD_REQUEST, 'VALIDATION_ERROR');
      return;
    }
    const positionService = getPositionService(req);
    const pos = await positionService.close(id);
    sendSuccess(res, parsePositionRecord(pos));
  } catch (err) {
    if (err instanceof NotFoundError) {
      sendError(res, err.message, StatusCodes.NOT_FOUND, err.code);
      return;
    }
    if (err instanceof ValidationError) {
      sendError(res, err.message, StatusCodes.BAD_REQUEST, err.code);
      return;
    }
    next(err);
  }
}
