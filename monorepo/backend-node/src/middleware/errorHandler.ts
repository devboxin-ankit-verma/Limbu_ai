/**
 * Global error handling middleware.
 *
 * Formats all errors with standard response shape: { success: false, error, code? }.
 * Uses AppError statusCode and code when available.
 */

import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from '../constants/api';
import { ErrorMessages } from '../constants/errors';
import { config } from '../config';
import { AppError } from '../utils/errors';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err);

  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : StatusCodes.INTERNAL_SERVER_ERROR;
  const message = err.message || ErrorMessages.INTERNAL_ERROR;
  const code = isAppError ? err.code : undefined;

  const body: { success: false; error: string; code?: string; details?: string } = {
    success: false,
    error: message
  };
  if (code) body.code = code;
  if (config.debug && err.message) body.details = err.message;

  res.status(statusCode).json(body);
};
