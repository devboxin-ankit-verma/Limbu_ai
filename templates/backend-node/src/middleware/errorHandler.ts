/**
 * Global error handling middleware.
 * 
 * This middleware handles all errors and formats responses consistently.
 */

import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from '../constants/api';
import { ErrorMessages } from '../constants/errors';
import {config} from '../config/index';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', err);
  
  // Default error response
  const statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  const message = ErrorMessages.INTERNAL_ERROR;
  
  res.status(statusCode).json({
    error: message,
    ...(config.debug === true && { details: err.message })
  });
};
