/**
 * Customer controller — request/response for customer browse and booking endpoints.
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ProviderService } from '../services/providerService';
import { BookingService } from '../services/bookingService';
import { StatusCodes } from '../constants/api';
import { ValidationError } from '../utils/errors';

function getProviderService(req: Request): ProviderService {
  return req.app.get('providerService');
}

function getBookingService(req: Request): BookingService {
  return req.app.get('bookingService');
}

export const browseProviders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const offset = parseInt(req.query.offset as string) || 0;
    const limit = parseInt(req.query.limit as string) || 20;
    const providers = await getProviderService(req).listApproved(offset, limit);
    res.status(StatusCodes.OK).json(providers);
  } catch (err) {
    next(err);
  }
};

export const createBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new ValidationError(errors.array()[0].msg);

    const result = await getBookingService(req).createBooking(req.user!.userId, req.body);
    res.status(StatusCodes.CREATED).json(result);
  } catch (err) {
    next(err);
  }
};

export const getBookingHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const offset = parseInt(req.query.offset as string) || 0;
    const limit = parseInt(req.query.limit as string) || 20;
    const bookings = await getBookingService(req).getCustomerBookings(req.user!.userId, offset, limit);
    res.status(StatusCodes.OK).json(bookings);
  } catch (err) {
    next(err);
  }
};

export const addReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new ValidationError(errors.array()[0].msg);
    const review = await getBookingService(req).addReview(req.user!.userId, req.body);
    res.status(StatusCodes.CREATED).json(review);
  } catch (err) {
    next(err);
  }
};
