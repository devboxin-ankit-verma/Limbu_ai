/**
 * Error messages and error codes.
 *
 * All error messages and error-related constants go here.
 */

export class ErrorMessages {
  // User errors
  static readonly USER_NOT_FOUND = 'User not found';
  static readonly USER_ALREADY_EXISTS = 'User with this phone already exists';
  static readonly INVALID_CREDENTIALS = 'Invalid phone number or password';

  // Provider errors
  static readonly PROVIDER_NOT_FOUND = 'Provider not found';
  static readonly PROVIDER_ALREADY_REGISTERED = 'Provider profile already exists';
  static readonly PROVIDER_NOT_APPROVED = 'Provider account is not yet approved';
  static readonly PROVIDER_PENDING_PAYMENT = 'Registration fee payment is pending';

  // Booking errors
  static readonly BOOKING_NOT_FOUND = 'Booking not found';
  static readonly SERVICE_NOT_FOUND = 'Service not found';

  // Authentication errors
  static readonly UNAUTHORIZED = 'Unauthorized access';
  static readonly FORBIDDEN = 'Forbidden: insufficient permissions';
  static readonly TOKEN_EXPIRED = 'Token has expired';
  static readonly TOKEN_INVALID = 'Invalid token';

  // Validation errors
  static readonly INVALID_INPUT = 'Invalid input provided';
  static readonly MISSING_REQUIRED_FIELD = 'Missing required field';

  // Payment errors
  static readonly PAYMENT_FAILED = 'Payment verification failed';
  static readonly INVALID_WEBHOOK_SIGNATURE = 'Invalid webhook signature';

  // General errors
  static readonly INTERNAL_ERROR = 'Internal server error';
  static readonly DATABASE_ERROR = 'Database operation failed';
}

export enum ErrorCodes {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  PROVIDER_NOT_FOUND = 'PROVIDER_NOT_FOUND',
  PROVIDER_NOT_APPROVED = 'PROVIDER_NOT_APPROVED',
  BOOKING_NOT_FOUND = 'BOOKING_NOT_FOUND',
  SERVICE_NOT_FOUND = 'SERVICE_NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  INVALID_INPUT = 'INVALID_INPUT',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
}
