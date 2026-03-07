/**
 * API-related constants.
 * 
 * All API endpoints and API-related constants go here.
 */

export const API_ENDPOINTS = {
  // User endpoints
  USERS: '/api/v1/users',
  USER_BY_ID: (userId: string) => `/api/v1/users/${userId}`,
  
  // Auth endpoints
  LOGIN: '/api/v1/login',
  REGISTER: '/api/v1/register',
  LOGOUT: '/api/v1/logout',
  CURRENT_USER: '/api/v1/me'
} as const;
