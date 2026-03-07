/**
 * Auth service - business logic for authentication.
 *
 * Admin login: validate credentials, issue JWT. Platform-independent; no UI logic.
 */

import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { AdminUserRepository } from '../repositories/adminUserRepository';
import { config } from '../config';
import { UnauthorizedError } from '../utils/errors';

export interface AdminLoginInput {
  email: string;
  password: string;
}

export interface AdminUserPayload {
  id: number;
  email: string;
  name: string | null;
  role: string;
}

export interface AdminLoginResult {
  token: string;
  adminUser: AdminUserPayload;
}

export interface JwtPayload {
  sub: string;
  role: string;
  type: 'admin';
  iat?: number;
  exp?: number;
}

export class AuthService {
  constructor(private readonly adminUserRepository: AdminUserRepository) {}

  /**
   * Admin login: validate email/password and return JWT + admin user payload.
   *
   * @param input - email and password
   * @returns token and adminUser (no password)
   * @throws UnauthorizedError if credentials invalid
   */
  async adminLogin(input: AdminLoginInput): Promise<AdminLoginResult> {
    const email = input.email?.trim()?.toLowerCase();
    if (!email || !input.password) {
      throw new UnauthorizedError('Email and password are required');
    }

    const admin = await this.adminUserRepository.findByEmail(email);
    if (!admin) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const valid = await bcrypt.compare(input.password, admin.passwordHash);
    if (!valid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: String(admin.id),
      role: admin.role,
      type: 'admin'
    };

    const signOptions: SignOptions = {
      expiresIn: config.jwtExpiresIn as SignOptions['expiresIn']
    };
    const token = jwt.sign(payload, config.jwtSecret, signOptions);

    const adminUser: AdminUserPayload = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role
    };

    return { token, adminUser };
  }

  /**
   * Verify JWT and return payload (for middleware).
   *
   * @param token - Bearer token string
   * @returns Decoded payload or null if invalid
   */
  verifyToken(token: string): JwtPayload | null {
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
      return decoded;
    } catch {
      return null;
    }
  }
}
