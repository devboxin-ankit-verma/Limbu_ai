/**
 * Notice controller - request/response for notices (broadcast messages).
 */

import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendList, sendError } from '../utils/response';
import { StatusCodes } from '../constants/api';
import { NoticeService } from '../services/noticeService';

function getNoticeService(req: Request): NoticeService {
  return req.app.get('noticeService');
}

export async function listNotices(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const target = (req.query.target as string) || undefined;
    const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
    const sort = (req.query.sort as string) || 'createdAt';
    const order = (req.query.order as string)?.toLowerCase() === 'asc' ? 'asc' : 'desc';

    const noticeService = getNoticeService(req);
    const { data, total } = await noticeService.list({
      skip: (page - 1) * limit,
      limit,
      target,
      isActive,
      sort,
      order
    });
    sendList(res, data, { page, limit, total });
  } catch (err) {
    next(err);
  }
}

export async function createNotice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, body, type, target } = req.body;
    if (!title || !body) {
      sendError(res, 'title and body are required', StatusCodes.BAD_REQUEST, 'VALIDATION_ERROR');
      return;
    }
    const noticeService = getNoticeService(req);
    const notice = await noticeService.create({ title, body, type, target });
    sendSuccess(res, notice, StatusCodes.CREATED);
  } catch (err) {
    next(err);
  }
}
