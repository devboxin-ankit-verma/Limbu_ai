/**
 * API-related constants.
 * 
 * All API endpoints, status codes, and API-related constants go here.
 */

// API Version
export const API_VERSION = 'v1';
export const API_PREFIX = `/api/${API_VERSION}`;

// HTTP Status Codes (use these instead of magic numbers)
export enum StatusCodes {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500
}
