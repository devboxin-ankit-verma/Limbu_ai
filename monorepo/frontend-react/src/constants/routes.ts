/**
 * Route-related constants.
 * 
 * All route paths and route-related constants go here.
 */

export const ROUTES = {
  HOME: '/',
  FRANCHISE: '/franchise',
  PRICING: '/pricing',
  BLOG: '/blog',
  USERS: '/users',
  USER_DETAIL: (userId: string) => `/users/${userId}`,
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
} as const;
