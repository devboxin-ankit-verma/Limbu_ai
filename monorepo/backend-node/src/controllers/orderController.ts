/**
 * Order controller - request/response for orders.
 */

import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendList, sendError } from '../utils/response';
import { StatusCodes } from '../constants/api';
import { NotFoundError, ValidationError } from '../utils/errors';
import { OrderService } from '../services/orderService';

function getOrderService(req: Request): OrderService {
  return req.app.get('orderService');
}

function parseOrderRecord(order: unknown): Record<string, unknown> {
  const o = order as Record<string, unknown>;
  return {
    id: o.id,
    userId: o.userId,
    symbolId: o.symbolId,
    side: o.side,
    type: o.type,
    quantity: o.quantity,
    price: o.price,
    status: o.status,
    filledQty: o.filledQty,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
    symbol: (o as { symbol?: unknown }).symbol,
    user: (o as { user?: unknown }).user
  };
}

export async function listOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;
    const userId = req.query.userId ? parseInt(req.query.userId as string, 10) : undefined;
    const symbolId = req.query.symbolId ? parseInt(req.query.symbolId as string, 10) : undefined;
    const status = (req.query.status as string) || undefined;
    const sort = (req.query.sort as string) || 'createdAt';
    const order = (req.query.order as string)?.toLowerCase() === 'asc' ? 'asc' : 'desc';

    const orderService = getOrderService(req);
    const { data, total } = await orderService.list({
      skip,
      limit,
      userId: isNaN(userId!) ? undefined : userId,
      symbolId: isNaN(symbolId!) ? undefined : symbolId,
      status,
      sort,
      order
    });
    const list = data.map(parseOrderRecord);
    sendList(res, list, { page, limit, total });
  } catch (err) {
    next(err);
  }
}

export async function getOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      sendError(res, 'Invalid order id', StatusCodes.BAD_REQUEST, 'VALIDATION_ERROR');
      return;
    }
    const orderService = getOrderService(req);
    const order = await orderService.getById(id);
    sendSuccess(res, parseOrderRecord(order));
  } catch (err) {
    if (err instanceof NotFoundError) {
      sendError(res, err.message, StatusCodes.NOT_FOUND, err.code);
      return;
    }
    next(err);
  }
}

export async function createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const orderService = getOrderService(req);
    const order = await orderService.create(req.body);
    sendSuccess(res, parseOrderRecord(order), StatusCodes.CREATED);
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

export async function executeOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      sendError(res, 'Invalid order id', StatusCodes.BAD_REQUEST, 'VALIDATION_ERROR');
      return;
    }
    const price = parseFloat(req.body.price);
    const brokerage = parseFloat(req.body.brokerage) || 0;
    if (isNaN(price) || price <= 0) {
      sendError(res, 'Valid execution price required', StatusCodes.BAD_REQUEST, 'VALIDATION_ERROR');
      return;
    }
    const orderService = getOrderService(req);
    const order = await orderService.execute(id, price, brokerage);
    sendSuccess(res, parseOrderRecord(order));
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

export async function cancelOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      sendError(res, 'Invalid order id', StatusCodes.BAD_REQUEST, 'VALIDATION_ERROR');
      return;
    }
    const orderService = getOrderService(req);
    const order = await orderService.cancel(id);
    sendSuccess(res, parseOrderRecord(order));
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
