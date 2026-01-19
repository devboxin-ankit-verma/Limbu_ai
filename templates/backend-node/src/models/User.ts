/**
 * User model - data definition only.
 * 
 * This module contains ONLY data structure definitions.
 * NO business logic, NO database queries.
 */

export interface User {
  id: number;
  email: string;
  username: string;
  hashedPassword: string;
  isActive: boolean;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  email: string;
  username: string;
  hashedPassword: string;
  isActive?: boolean;
  isAdmin?: boolean;
}

export interface UpdateUserData {
  email?: string;
  username?: string;
  hashedPassword?: string;
  isActive?: boolean;
  isAdmin?: boolean;
}
