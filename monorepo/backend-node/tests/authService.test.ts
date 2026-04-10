/**
 * Unit tests for AuthService.
 *
 * Uses Jest mocks — no real database connection required.
 */

import { AuthService } from '../src/services/authService';
import { UserRepository } from '../src/repositories/userRepository';
import { ProviderRepository } from '../src/repositories/providerRepository';

// Mock bcryptjs so we don't run the actual hashing in tests
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn(),
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock_token'),
  verify: jest.fn(),
}));

// Mock config to avoid env validation
jest.mock('../src/config', () => ({
  config: {
    jwt: { secret: 'test_secret', expirySeconds: 3600, refreshExpirySeconds: 86400 },
  },
}));

import bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepo: jest.Mocked<UserRepository>;
  let mockProviderRepo: jest.Mocked<ProviderRepository>;

  beforeEach(() => {
    mockUserRepo = {
      findByPhone: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    mockProviderRepo = {
      create: jest.fn(),
      findByUserId: jest.fn(),
      findById: jest.fn(),
      findApproved: jest.fn(),
      findByStatus: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      incrementWallet: jest.fn(),
    } as unknown as jest.Mocked<ProviderRepository>;

    authService = new AuthService(mockUserRepo, mockProviderRepo);
  });

  afterEach(() => jest.clearAllMocks());

  // ── register ──────────────────────────────────────────────────────
  describe('register', () => {
    it('should register a customer successfully', async () => {
      mockUserRepo.findByPhone.mockResolvedValue(null);
      mockUserRepo.create.mockResolvedValue({
        id: 1, name: 'Test User', phone: '9876543210',
        email: null, passwordHash: 'hashed_password', role: 'customer',
        createdAt: new Date(), updatedAt: new Date(),
      } as any);

      const result = await authService.register({
        name: 'Test User',
        phone: '9876543210',
        password: 'password123',
        role: 'customer',
      });

      expect(result.userId).toBe(1);
      expect(result.role).toBe('customer');
      expect(result.accessToken).toBe('mock_token');
      expect(mockUserRepo.findByPhone).toHaveBeenCalledWith('9876543210');
      expect(mockUserRepo.create).toHaveBeenCalledTimes(1);
      expect(mockProviderRepo.create).not.toHaveBeenCalled();
    });

    it('should create a provider record when role is provider', async () => {
      mockUserRepo.findByPhone.mockResolvedValue(null);
      mockUserRepo.create.mockResolvedValue({
        id: 2, name: 'Massage Pro', phone: '9123456789',
        email: null, passwordHash: 'hashed_password', role: 'provider',
        createdAt: new Date(), updatedAt: new Date(),
      } as any);
      mockProviderRepo.create.mockResolvedValue({} as any);

      await authService.register({
        name: 'Massage Pro',
        phone: '9123456789',
        password: 'password123',
        role: 'provider',
      });

      expect(mockProviderRepo.create).toHaveBeenCalledWith({
        userId: 2,
        status: 'pending',
      });
    });

    it('should throw ConflictError when phone already exists', async () => {
      mockUserRepo.findByPhone.mockResolvedValue({ id: 1 } as any);

      await expect(
        authService.register({
          name: 'Existing User', phone: '9876543210',
          password: 'password123', role: 'customer',
        })
      ).rejects.toMatchObject({ statusCode: 409 });
    });
  });

  // ── login ──────────────────────────────────────────────────────────
  describe('login', () => {
    it('should return tokens on valid credentials', async () => {
      mockUserRepo.findByPhone.mockResolvedValue({
        id: 1, role: 'customer', passwordHash: 'hashed_password',
      } as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.login({ phone: '9876543210', password: 'password123' });

      expect(result.accessToken).toBe('mock_token');
      expect(result.userId).toBe(1);
    });

    it('should throw UnauthorizedError when user not found', async () => {
      mockUserRepo.findByPhone.mockResolvedValue(null);

      await expect(
        authService.login({ phone: '9999999999', password: 'wrong' })
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it('should throw UnauthorizedError when password is wrong', async () => {
      mockUserRepo.findByPhone.mockResolvedValue({
        id: 1, role: 'customer', passwordHash: 'hashed_password',
      } as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login({ phone: '9876543210', password: 'wrong_password' })
      ).rejects.toMatchObject({ statusCode: 401 });
    });
  });
});
