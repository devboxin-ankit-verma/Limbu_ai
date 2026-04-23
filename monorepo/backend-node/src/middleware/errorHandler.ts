/**
 * Global error handling middleware.
 *
 * Handles AppError subclasses with their status codes,
 * and falls back to 500 for unexpected errors.
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { config } from '../config';

// Sequelize error names we recognise
const SEQUELIZE_UNIQUE = 'SequelizeUniqueConstraintError';
const SEQUELIZE_VALIDATION = 'SequelizeValidationError';
const SEQUELIZE_FK = 'SequelizeForeignKeyConstraintError';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Known application errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      ...(config.debug && { stack: err.stack }),
    });
    return;
  }

  // Sequelize unique constraint → 409 Conflict
  if (err.name === SEQUELIZE_UNIQUE) {
    const field = (err as unknown as { fields?: Record<string, string> }).fields;
    const key = field ? Object.keys(field)[0] : 'field';
    res.status(409).json({
      error: `${key.charAt(0).toUpperCase() + key.slice(1)} is already registered. Please sign in.`,
      code: 'DUPLICATE_ENTRY',
    });
    return;
  }

  // Sequelize validation error → 422
  if (err.name === SEQUELIZE_VALIDATION) {
    res.status(422).json({
      error: (err as unknown as { errors?: Array<{ message: string }> }).errors?.[0]?.message ?? 'Validation failed',
      code: 'VALIDATION_ERROR',
    });
    return;
  }

  // Sequelize FK constraint → 400
  if (err.name === SEQUELIZE_FK) {
    res.status(400).json({
      error: 'Referenced record does not exist',
      code: 'FK_CONSTRAINT',
    });
    return;
  }

  // Sequelize DB error (unknown column, bad SQL, connection issue)
  if (err.name === 'SequelizeDatabaseError' || err.name === 'SequelizeConnectionError') {
    const parent = (err as unknown as { parent?: { sqlMessage?: string; code?: string } }).parent;
    const detail = parent?.sqlMessage ?? err.message;
    console.error('[DB Error]', detail);
    res.status(500).json({
      error: 'A database error occurred. Please try again later.',
      code: 'DATABASE_ERROR',
      ...(config.debug && { details: detail }),
    });
    return;
  }

  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    ...(config.debug && { details: err.message }),
  });
};
