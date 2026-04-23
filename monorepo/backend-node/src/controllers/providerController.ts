/**
 * Provider controller — request/response for provider profile endpoints.
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

export const getMyProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const provider = await getProviderService(req).getProviderByUserId(req.user!.userId);
    res.status(StatusCodes.OK).json(provider);
  } catch (err) {
    next(err);
  }
};

export const getProviderById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const provider = await getProviderService(req).getProviderById(parseInt(req.params.id));
    res.status(StatusCodes.OK).json(provider);
  } catch (err) {
    next(err);
  }
};

export const setupProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new ValidationError(errors.array()[0].msg);

    const provider = await getProviderService(req).setupProfile(req.user!.userId, req.body);
    res.status(StatusCodes.OK).json(provider);
  } catch (err) {
    next(err);
  }
};

export const createRegistrationOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const order = await getProviderService(req).createRegistrationOrder(req.user!.userId);
    res.status(StatusCodes.CREATED).json(order);
  } catch (err) {
    next(err);
  }
};

export const getWalletHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await getProviderService(req).getWalletHistory(req.user!.userId);
    res.status(StatusCodes.OK).json(result);
  } catch (err) {
    next(err);
  }
};

export const completeRegistrationWithoutOnlinePayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new ValidationError(errors.array()[0].msg);

    const paymentMethod = req.body.paymentMethod as 'cod' | 'upi';
    const result = await getProviderService(req).completeRegistrationWithoutOnlinePayment(
      req.user!.userId,
      paymentMethod
    );
    res.status(StatusCodes.OK).json(result);
  } catch (err) {
    next(err);
  }
};

export const uploadProviderPhotos = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const files = (req.files as Express.Multer.File[]) || [];
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const photoUrls = files.map((file) => `${baseUrl}/uploads/providers/${file.filename}`);
    res.status(StatusCodes.CREATED).json({ photos: photoUrls });
  } catch (err) {
    next(err);
  }
};

export const getMyBookings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const offset = parseInt(req.query.offset as string) || 0;
    const limit = parseInt(req.query.limit as string) || 20;
    const bookings = await getBookingService(req).getProviderBookings(req.user!.userId, offset, limit);
    res.status(StatusCodes.OK).json(bookings);
  } catch (err) {
    next(err);
  }
};

export const completeMyBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const bookingId = parseInt(req.params.id);
    const booking = await getBookingService(req).completeProviderBooking(req.user!.userId, bookingId);
    res.status(StatusCodes.OK).json(booking);
  } catch (err) {
    next(err);
  }
};

export const uploadProviderDocuments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const files = (req.files as Record<string, Express.Multer.File[]>) || {};
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const aadhaarFile = files['aadhaar']?.[0];
    const passportFile = files['passportPhoto']?.[0];

    if (!aadhaarFile || !passportFile) {
      res.status(400).json({ message: 'Both aadhaar and passportPhoto files are required' });
      return;
    }

    const aadhaarUrl = `${baseUrl}/uploads/documents/${aadhaarFile.filename}`;
    const passportPhotoUrl = `${baseUrl}/uploads/documents/${passportFile.filename}`;

    const provider = await getProviderService(req).updateDocuments(
      req.user!.userId,
      { aadhaarUrl, passportPhotoUrl }
    );

    res.status(StatusCodes.OK).json({ aadhaarUrl, passportPhotoUrl, provider });
  } catch (err) {
    next(err);
  }
};

export const updateIdentityVisibility = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const identityHidden = Boolean(req.body.identityHidden);
    const provider = await getProviderService(req).updateIdentityVisibility(
      req.user!.userId,
      identityHidden
    );
    res.status(StatusCodes.OK).json(provider);
  } catch (err) {
    next(err);
  }
};

export const getProviderReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const offset = parseInt(req.query.offset as string) || 0;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await getProviderService(req).getProviderReviews(parseInt(req.params.id), offset, limit);
    res.status(StatusCodes.OK).json(result);
  } catch (err) {
    next(err);
  }
};
