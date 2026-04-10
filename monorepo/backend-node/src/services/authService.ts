/**
 * Auth service — business logic for registration and login.
 *
 * Handles password hashing, JWT generation, and user creation.
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { UserRepository } from '../repositories/userRepository';
import { ProviderRepository } from '../repositories/providerRepository';
import { ConflictError, UnauthorizedError } from '../utils/errors';
import { ErrorMessages } from '../constants/errors';
import { AuthPayload } from '../types/express';

const SALT_ROUNDS = 10;

export class AuthService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly providerRepo: ProviderRepository
  ) {}

  async register(data: {
    name: string;
    phone: string;
    email?: string;
    password: string;
    role: 'provider' | 'customer';
    age?: number;
    gender?: string;
  }): Promise<{ accessToken: string; refreshToken: string; userId: number; role: string }> {
    const existing = await this.userRepo.findByPhone(data.phone);
    if (existing) throw new ConflictError(ErrorMessages.USER_ALREADY_EXISTS);

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
    const user = await this.userRepo.create({
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      passwordHash,
      role: data.role,
    });

    if (data.role === 'provider') {
      await this.providerRepo.create({ userId: user.id, status: 'pending' });
    }

    const tokens = this.generateTokens({ userId: user.id, role: user.role });
    return { ...tokens, userId: user.id, role: user.role };
  }

  async login(data: {
    identifier: string; // phone number OR email
    password: string;
  }): Promise<{ accessToken: string; refreshToken: string; userId: number; role: string }> {
    const isEmail = data.identifier.includes('@');
    const user = isEmail
      ? await this.userRepo.findByEmail(data.identifier)
      : await this.userRepo.findByPhone(data.identifier);

    if (!user) throw new UnauthorizedError(ErrorMessages.INVALID_CREDENTIALS);

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) throw new UnauthorizedError(ErrorMessages.INVALID_CREDENTIALS);

    const tokens = this.generateTokens({ userId: user.id, role: user.role });
    return { ...tokens, userId: user.id, role: user.role };
  }

  refreshToken(token: string): { accessToken: string } {
    try {
      const payload = jwt.verify(token, config.jwt.secret) as AuthPayload;
      const accessToken = jwt.sign({ userId: payload.userId, role: payload.role }, config.jwt.secret, {
        expiresIn: config.jwt.expirySeconds,
      });
      return { accessToken };
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  private generateTokens(payload: AuthPayload): { accessToken: string; refreshToken: string } {
    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expirySeconds,
    });
    const refreshToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.refreshExpirySeconds,
    });
    return { accessToken, refreshToken };
  }
}
