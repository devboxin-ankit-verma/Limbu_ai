/**
 * User model - data definition only.
 *
 * Aligns with Prisma User. Use UserResponse for API (no password).
 */

export interface User {
  id: number;
  email: string;
  username: string;
  passwordHash: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** User payload for API responses (no password). */
export interface UserResponse {
  id: number;
  email: string;
  username: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  email: string;
  username: string;
  passwordHash: string;
  role?: string;
  isActive?: boolean;
}

export interface UpdateUserData {
  email?: string;
  username?: string;
  passwordHash?: string;
  role?: string;
  isActive?: boolean;
}
