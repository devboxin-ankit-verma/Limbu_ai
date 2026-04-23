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
import { PaymentRepository } from '../repositories/paymentRepository';
import { ConflictError, UnauthorizedError } from '../utils/errors';
import { ErrorMessages } from '../constants/errors';
import { AuthPayload } from '../types/express';

const SALT_ROUNDS = 10;

export class AuthService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly providerRepo: ProviderRepository,
    private readonly paymentRepo: PaymentRepository
  ) {}

  async register(data: {
    name: string;
    phone: string;
    email?: string;
    password: string;
    role: 'provider' | 'customer';
    age?: number;
    gender?: string;
    providerCode?: string;
  }): Promise<{ accessToken: string; refreshToken: string; userId: number; role: string }> {
    if (await this.userRepo.phoneExists(data.phone)) {
      throw new ConflictError('This phone number is already registered. Please sign in.');
    }
    if (data.email && await this.userRepo.emailExists(data.email)) {
      throw new ConflictError('This email is already registered. Please sign in.');
    }

    let referringProviderId: number | null = null;
    if (data.role === 'customer' && !data.providerCode?.trim()) {
      throw new ConflictError('Service Provider Code is required');
    }
    if (data.providerCode?.trim()) {
      const refProvider = await this.providerRepo.findByProviderCode(data.providerCode.trim().toUpperCase());
      if (!refProvider) {
        throw new ConflictError('Invalid service provider code');
      }
      referringProviderId = refProvider.id;
    }

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
    const user = await this.userRepo.create({
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      passwordHash,
      role: data.role,
      age: data.age ?? null,
      gender: (data.gender as 'male' | 'female' | 'other' | undefined) ?? null,
      referredByProviderId: referringProviderId,
    });

    if (data.role === 'provider') {
      await this.providerRepo.create({ userId: user.id, status: 'pending' });
    }

    if (referringProviderId) {
      const refProvider = await this.providerRepo.findById(referringProviderId);
      if (refProvider) {
        const nextCount = (refProvider.referredUsersCount ?? 0) + 1;
        await this.providerRepo.update(refProvider.id, { referredUsersCount: nextCount });

        if (nextCount >= 10 && !refProvider.registrationRefundPaidAt) {
          await this.providerRepo.incrementWallet(refProvider.id, 10000);
          await this.paymentRepo.createWalletTxn({
            providerId: refProvider.id,
            amount: 10000,
            type: 'credit',
            note: 'MLM reward: 10 referrals completed',
          });
          await this.providerRepo.update(refProvider.id, {
            registrationRefundPaidAt: new Date(),
          });
        }
      }
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
