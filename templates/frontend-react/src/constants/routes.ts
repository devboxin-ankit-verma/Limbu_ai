/**
 * Route-related constants.
 * 
 * All route paths and route-related constants go here.
 */

export const ROUTES = {
  HOME: '/',
  USERS: '/users',
  USER_DETAIL: (userId: string) => `/users/${userId}`,
  LOGIN: '/login',
  REGISTER: '/register'
} as const;
