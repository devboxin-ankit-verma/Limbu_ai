/**
 * Standard API response utilities.
 *
 * All JSON responses use a consistent format for Admin Panel, User Panel, and Mobile App.
 * No UI-specific fields; platform-independent contract.
 */

import { Response } from 'express';
import { StatusCodes } from '../constants/api';

/** Meta for paginated list responses */
export interface ListMeta {
  page: number;
  limit: number;
  total: number;
}

/**
 * Send a success response with data.
 *
 * @param res - Express response object
 * @param data - Response payload
 * @param statusCode - HTTP status (default 200)
 * @param message - Optional message
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode: number = StatusCodes.OK,
  message?: string
): void {
  const body: { success: true; data: T; message?: string } = {
    success: true,
    data
  };
  if (message) body.message = message;
  res.status(statusCode).json(body);
}

/**
 * Send a paginated list response.
 *
 * @param res - Express response object
 * @param data - Array of items
 * @param meta - Pagination meta (page, limit, total)
 * @param statusCode - HTTP status (default 200)
 */
export function sendList<T>(
  res: Response,
  data: T[],
  meta: ListMeta,
  statusCode: number = StatusCodes.OK
): void {
  res.status(statusCode).json({
    success: true,
    data,
    meta
  });
}

/**
 * Send an error response in standard format.
 *
 * @param res - Express response object
 * @param error - Error message string
 * @param statusCode - HTTP status (default 500)
 * @param code - Optional error code for clients
 */
export function sendError(
  res: Response,
  error: string,
  statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
  code?: string
): void {
  const body: { success: false; error: string; code?: string } = {
    success: false,
    error
  };
  if (code) body.code = code;
  res.status(statusCode).json(body);
}
