/**
 * Symbol controller - request/response for symbols (instruments).
 */

import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendList, sendError } from '../utils/response';
import { StatusCodes } from '../constants/api';
import { NotFoundError } from '../utils/errors';
import { SymbolService } from '../services/symbolService';

function getSymbolService(req: Request): SymbolService {
  return req.app.get('symbolService');
}

export async function listSymbols(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const marketId = req.query.marketId ? parseInt(req.query.marketId as string, 10) : undefined;
    const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
    const search = (req.query.q as string) || (req.query.search as string);
    const requestedSort = (req.query.sort as string) || 'code';
    const order = (req.query.order as string)?.toLowerCase() === 'asc' ? 'asc' : 'desc';
    const withQuotes = req.query.withQuotes === 'true' || req.query.withQuotes === '1';
    const symbolSortKeys = ['code', 'name', 'id', 'marketId', 'isActive', 'createdAt', 'updatedAt'];
    const sort = symbolSortKeys.includes(requestedSort) ? requestedSort : 'code';

    const symbolService = getSymbolService(req);
    const { data, total } = await symbolService.list({
      skip: (page - 1) * limit,
      limit,
      marketId: marketId !== undefined && !isNaN(marketId) ? marketId : undefined,
      isActive,
      search,
      sort,
      order,
      withQuotes
    });
    sendList(res, data, { page, limit, total });
  } catch (err) {
    next(err);
  }
}

export async function getSymbol(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      sendError(res, 'Invalid symbol id', StatusCodes.BAD_REQUEST, 'VALIDATION_ERROR');
      return;
    }
    const symbolService = getSymbolService(req);
    const symbol = await symbolService.getById(id);
    sendSuccess(res, symbol);
  } catch (err) {
    if (err instanceof NotFoundError) {
      sendError(res, err.message, StatusCodes.NOT_FOUND, err.code);
      return;
    }
    next(err);
  }
}

export async function createSymbol(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const symbolService = getSymbolService(req);
    const symbol = await symbolService.create(req.body);
    sendSuccess(res, symbol, StatusCodes.CREATED);
  } catch (err) {
    next(err);
  }
}

export async function updateSymbol(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      sendError(res, 'Invalid symbol id', StatusCodes.BAD_REQUEST, 'VALIDATION_ERROR');
      return;
    }
    const symbolService = getSymbolService(req);
    const symbol = await symbolService.update(id, req.body);
    sendSuccess(res, symbol);
  } catch (err) {
    if (err instanceof NotFoundError) {
      sendError(res, err.message, StatusCodes.NOT_FOUND, err.code);
      return;
    }
    next(err);
  }
}

export async function toggleSymbol(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      sendError(res, 'Invalid symbol id', StatusCodes.BAD_REQUEST, 'VALIDATION_ERROR');
      return;
    }
    const symbolService = getSymbolService(req);
    const symbol = await symbolService.toggleActive(id);
    sendSuccess(res, symbol);
  } catch (err) {
    if (err instanceof NotFoundError) {
      sendError(res, err.message, StatusCodes.NOT_FOUND, err.code);
      return;
    }
    next(err);
  }
}
