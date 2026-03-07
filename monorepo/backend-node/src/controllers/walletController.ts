/**
 * Wallet controller - request/response for wallets and transactions.
 */

import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendList, sendError } from '../utils/response';
import { StatusCodes } from '../constants/api';
import { NotFoundError, ValidationError } from '../utils/errors';
import { WalletService } from '../services/walletService';

function getWalletService(req: Request): WalletService {
  return req.app.get('walletService');
}

function parseWalletRecord(w: unknown): Record<string, unknown> {
  const wallet = w as Record<string, unknown>;
  return {
    id: wallet.id,
    userId: wallet.userId,
    currency: wallet.currency,
    balance: wallet.balance,
    lockedBalance: wallet.lockedBalance,
    updatedAt: wallet.updatedAt
  };
}

export async function listWallets(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.query.userId ? parseInt(req.query.userId as string, 10) : undefined;
    if (userId === undefined || isNaN(userId)) {
      sendError(res, 'userId query is required', StatusCodes.BAD_REQUEST, 'VALIDATION_ERROR');
      return;
    }
    const walletService = getWalletService(req);
    const wallets = await walletService.getWalletsByUserId(userId);
    sendSuccess(res, wallets.map(parseWalletRecord));
  } catch (err) {
    next(err);
  }
}

export async function deposit(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId, amount, currency, reference } = req.body;
    const uid = parseInt(String(userId), 10);
    const amt = parseFloat(String(amount));
    if (isNaN(uid) || isNaN(amt)) {
      sendError(res, 'userId and amount are required', StatusCodes.BAD_REQUEST, 'VALIDATION_ERROR');
      return;
    }
    const walletService = getWalletService(req);
    const wallet = await walletService.deposit(uid, amt, currency || 'INR', reference);
    sendSuccess(res, parseWalletRecord(wallet), StatusCodes.OK);
  } catch (err) {
    if (err instanceof ValidationError) {
      sendError(res, err.message, StatusCodes.BAD_REQUEST, err.code);
      return;
    }
    next(err);
  }
}

export async function withdraw(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId, amount, currency } = req.body;
    const uid = parseInt(String(userId), 10);
    const amt = parseFloat(String(amount));
    if (isNaN(uid) || isNaN(amt)) {
      sendError(res, 'userId and amount are required', StatusCodes.BAD_REQUEST, 'VALIDATION_ERROR');
      return;
    }
    const walletService = getWalletService(req);
    const wallet = await walletService.withdraw(uid, amt, currency || 'INR');
    sendSuccess(res, parseWalletRecord(wallet), StatusCodes.OK);
  } catch (err) {
    if (err instanceof ValidationError) {
      sendError(res, err.message, StatusCodes.BAD_REQUEST, err.code);
      return;
    }
    next(err);
  }
}

export async function getWalletTransactions(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const walletId = parseInt(req.params.walletId, 10);
    if (isNaN(walletId)) {
      sendError(res, 'Invalid wallet id', StatusCodes.BAD_REQUEST, 'VALIDATION_ERROR');
      return;
    }
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const type = (req.query.type as string) || undefined;

    const walletService = getWalletService(req);
    await walletService.getWalletById(walletId);
    const { data, total } = await walletService.getTransactions(walletId, {
      skip: (page - 1) * limit,
      limit,
      type
    });
    const list = data.map((d: unknown) => {
      const t = d as Record<string, unknown>;
      return {
        id: t.id,
        walletId: t.walletId,
        type: t.type,
        amount: t.amount,
        refId: t.refId,
        refType: t.refType,
        metadata: t.metadata,
        createdAt: t.createdAt
      };
    });
    sendList(res, list, { page, limit, total });
  } catch (err) {
    if (err instanceof NotFoundError) {
      sendError(res, err.message, StatusCodes.NOT_FOUND, err.code);
      return;
    }
    next(err);
  }
}
