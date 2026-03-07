/**
 * Error messages and error codes.
 * 
 * All error messages and error-related constants go here.
 */

export class ErrorMessages {
  // User errors
  static readonly USER_NOT_FOUND = 'User not found';
  static readonly USER_ALREADY_EXISTS = 'User already exists';
  static readonly INVALID_CREDENTIALS = 'Invalid credentials';
  
  // Authentication errors
  static readonly UNAUTHORIZED = 'Unauthorized access';
  static readonly TOKEN_EXPIRED = 'Token has expired';
  static readonly TOKEN_INVALID = 'Invalid token';
  
  // Validation errors
  static readonly INVALID_INPUT = 'Invalid input provided';
  static readonly MISSING_REQUIRED_FIELD = 'Missing required field';
  
  // General errors
  static readonly INTERNAL_ERROR = 'Internal server error';
  static readonly DATABASE_ERROR = 'Database operation failed';
}

export enum ErrorCodes {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  UNAUTHORIZED = 'UNAUTHORIZED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  INVALID_INPUT = 'INVALID_INPUT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR'
}
