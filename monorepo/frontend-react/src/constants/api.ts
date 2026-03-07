/**
 * API-related constants.
 * 
 * All API endpoints and API-related constants go here.
 */

export const API_ENDPOINTS = {
  AUTH_ADMIN_LOGIN: '/api/v1/auth/admin/login',
  USERS: '/api/v1/users',
  USER_BY_ID: (userId: string) => `/api/v1/users/${userId}`,
  LOGIN: '/api/v1/auth/admin/login',
  REGISTER: '/api/v1/register',
  LOGOUT: '/api/v1/logout',
  CURRENT_USER: '/api/v1/me',
  MARKETS: '/api/v1/markets',
  SYMBOLS: '/api/v1/symbols',
} as const;
