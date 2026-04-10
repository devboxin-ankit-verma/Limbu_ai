/**
 * Role-based access control middleware.
 *
 * Must be used AFTER authenticate middleware.
 */

import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/errors';
import { UserRole } from '../constants/roles';

export const requireAdmin = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== UserRole.ADMIN) {
    return next(new ForbiddenError('Admin access required'));
  }
  next();
};

export const requireProvider = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== UserRole.PROVIDER) {
    return next(new ForbiddenError('Provider access required'));
  }
  next();
};

export const requireCustomer = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== UserRole.CUSTOMER) {
    return next(new ForbiddenError('Customer access required'));
  }
  next();
};
