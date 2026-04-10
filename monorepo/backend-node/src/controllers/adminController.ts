/**
 * Admin controller — request/response for admin management endpoints.
 */

import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/adminService';
import { StatusCodes } from '../constants/api';

function getAdminService(req: Request): AdminService {
  return req.app.get('adminService');
}

export const getDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stats = await getAdminService(req).getDashboardStats();
    res.status(StatusCodes.OK).json(stats);
  } catch (err) {
    next(err);
  }
};

export const getDashboardTrends = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const trends = await getAdminService(req).getDashboardTrends();
    res.status(StatusCodes.OK).json(trends);
  } catch (err) {
    next(err);
  }
};

export const listProviders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const status = (req.query.status as 'pending' | 'approved' | 'rejected') || 'pending';
    const offset = parseInt(req.query.offset as string) || 0;
    const limit = parseInt(req.query.limit as string) || 20;
    const providers = await getAdminService(req).listProviders(status, offset, limit);
    res.status(StatusCodes.OK).json(providers);
  } catch (err) {
    next(err);
  }
};

export const approveProvider = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const provider = await getAdminService(req).approveProvider(parseInt(req.params.id));
    res.status(StatusCodes.OK).json(provider);
  } catch (err) {
    next(err);
  }
};

export const rejectProvider = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const provider = await getAdminService(req).rejectProvider(parseInt(req.params.id));
    res.status(StatusCodes.OK).json(provider);
  } catch (err) {
    next(err);
  }
};

export const listUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const offset = parseInt(req.query.offset as string) || 0;
    const limit = parseInt(req.query.limit as string) || 50;
    const role = req.query.role as 'provider' | 'customer' | 'admin' | undefined;
    const query = (req.query.query as string) || undefined;
    const includeDeleted = req.query.includeDeleted === 'true';
    const users = await getAdminService(req).listUsers(offset, limit, { role, query, includeDeleted });
    res.status(StatusCodes.OK).json(users);
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await getAdminService(req).updateUser(parseInt(req.params.id), req.body);
    res.status(StatusCodes.OK).json(user);
  } catch (err) {
    next(err);
  }
};

export const softDeleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await getAdminService(req).softDeleteUser(parseInt(req.params.id));
    res.status(StatusCodes.OK).json({ message: 'User soft deleted' });
  } catch (err) {
    next(err);
  }
};

export const restoreUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await getAdminService(req).restoreUser(parseInt(req.params.id));
    res.status(StatusCodes.OK).json({ message: 'User restored' });
  } catch (err) {
    next(err);
  }
};

export const listBookings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const offset = parseInt(req.query.offset as string) || 0;
    const limit = parseInt(req.query.limit as string) || 50;
    const bookings = await getAdminService(req).listBookings(offset, limit);
    res.status(StatusCodes.OK).json(bookings);
  } catch (err) {
    next(err);
  }
};

export const listPayments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const offset = parseInt(req.query.offset as string) || 0;
    const limit = parseInt(req.query.limit as string) || 50;
    const payments = await getAdminService(req).listPayments(offset, limit);
    res.status(StatusCodes.OK).json(payments);
  } catch (err) {
    next(err);
  }
};

export const getAccountSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const settings = await getAdminService(req).getAccountSettings();
    res.status(StatusCodes.OK).json(settings);
  } catch (err) {
    next(err);
  }
};

export const updateAccountSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const settings = await getAdminService(req).updateAccountSettings(req.body);
    res.status(StatusCodes.OK).json(settings);
  } catch (err) {
    next(err);
  }
};
