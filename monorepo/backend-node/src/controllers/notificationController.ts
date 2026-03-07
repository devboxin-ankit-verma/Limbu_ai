/**
 * Notification controller - per-user notifications.
 */

import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendList, sendError } from '../utils/response';
import { StatusCodes } from '../constants/api';
import { NotFoundError } from '../utils/errors';
import { NotificationService } from '../services/notificationService';

function getNotificationService(req: Request): NotificationService {
  return req.app.get('notificationService');
}

export async function listNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id ?? parseInt(req.query.userId as string, 10);
    if (!userId || isNaN(userId)) {
      sendError(res, 'userId required', StatusCodes.BAD_REQUEST, 'VALIDATION_ERROR');
      return;
    }
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const read = req.query.read === 'true' ? true : req.query.read === 'false' ? false : undefined;

    const notificationService = getNotificationService(req);
    const { data, total } = await notificationService.listByUserId(userId, {
      skip: (page - 1) * limit,
      limit,
      read
    });
    sendList(res, data, { page, limit, total });
  } catch (err) {
    next(err);
  }
}

export async function markNotificationRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    const userId = req.user?.id ?? parseInt(req.body.userId ?? req.query.userId as string, 10);
    if (isNaN(id) || !userId || isNaN(userId)) {
      sendError(res, 'Invalid id or userId', StatusCodes.BAD_REQUEST, 'VALIDATION_ERROR');
      return;
    }
    const notificationService = getNotificationService(req);
    await notificationService.markRead(id, userId);
    sendSuccess(res, { id, read: true });
  } catch (err) {
    if (err instanceof NotFoundError) {
      sendError(res, err.message, StatusCodes.NOT_FOUND, err.code);
      return;
    }
    next(err);
  }
}
