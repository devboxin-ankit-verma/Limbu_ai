/**
 * Report controller - turnover, PnL, brokerage reports.
 */

import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { StatusCodes } from '../constants/api';
import { ReportService } from '../services/reportService';

function getReportService(req: Request): ReportService {
  return req.app.get('reportService');
}

export async function turnoverReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom as string) : new Date(0);
    const dateTo = req.query.dateTo ? new Date(req.query.dateTo as string) : new Date();
    const userId = req.query.userId ? parseInt(req.query.userId as string, 10) : undefined;
    const groupBy = (req.query.groupBy as 'day' | 'symbol' | 'user') || 'day';
    if (isNaN(dateFrom.getTime()) || isNaN(dateTo.getTime())) {
      sendError(res, 'Invalid date range', StatusCodes.BAD_REQUEST, 'VALIDATION_ERROR');
      return;
    }
    const reportService = getReportService(req);
    const data = await reportService.getTurnover({ dateFrom, dateTo, userId: isNaN(userId!) ? undefined : userId, groupBy });
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
}

export async function profitLossReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom as string) : new Date(0);
    const dateTo = req.query.dateTo ? new Date(req.query.dateTo as string) : new Date();
    const userId = req.query.userId ? parseInt(req.query.userId as string, 10) : undefined;
    if (isNaN(dateFrom.getTime()) || isNaN(dateTo.getTime())) {
      sendError(res, 'Invalid date range', StatusCodes.BAD_REQUEST, 'VALIDATION_ERROR');
      return;
    }
    const reportService = getReportService(req);
    const data = await reportService.getProfitLoss({ dateFrom, dateTo, userId: isNaN(userId!) ? undefined : userId });
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
}

export async function brokerageReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom as string) : new Date(0);
    const dateTo = req.query.dateTo ? new Date(req.query.dateTo as string) : new Date();
    const userId = req.query.userId ? parseInt(req.query.userId as string, 10) : undefined;
    if (isNaN(dateFrom.getTime()) || isNaN(dateTo.getTime())) {
      sendError(res, 'Invalid date range', StatusCodes.BAD_REQUEST, 'VALIDATION_ERROR');
      return;
    }
    const reportService = getReportService(req);
    const data = await reportService.getBrokerage({ dateFrom, dateTo, userId: isNaN(userId!) ? undefined : userId });
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
}
