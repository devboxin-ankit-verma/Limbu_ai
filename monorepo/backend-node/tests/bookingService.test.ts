/**
 * Unit tests for BookingService.
 */

// Mock Razorpay before any imports
jest.mock('razorpay', () => {
  return jest.fn().mockImplementation(() => ({
    orders: {
      create: jest.fn().mockResolvedValue({ id: 'order_test123' }),
    },
  }));
});

jest.mock('../src/config', () => ({
  config: {
    razorpay: { keyId: 'rzp_test', keySecret: 'test_secret' },
    providerRegistrationFee: 99900,
  },
}));

import { BookingService } from '../src/services/bookingService';
import { BookingRepository } from '../src/repositories/bookingRepository';
import { ProviderRepository } from '../src/repositories/providerRepository';
import { MassageServiceRepository } from '../src/repositories/serviceRepository';
import { PaymentRepository } from '../src/repositories/paymentRepository';

describe('BookingService', () => {
  let bookingService: BookingService;
  let mockBookingRepo: jest.Mocked<BookingRepository>;
  let mockProviderRepo: jest.Mocked<ProviderRepository>;
  let mockServiceRepo: jest.Mocked<MassageServiceRepository>;
  let mockPaymentRepo: jest.Mocked<PaymentRepository>;

  beforeEach(() => {
    mockBookingRepo = {
      create: jest.fn(),
      findByCustomer: jest.fn(),
      findByProvider: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      count: jest.fn(),
      updateStatus: jest.fn(),
    } as unknown as jest.Mocked<BookingRepository>;

    mockProviderRepo = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findApproved: jest.fn(),
      findByStatus: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      incrementWallet: jest.fn(),
    } as unknown as jest.Mocked<ProviderRepository>;

    mockServiceRepo = {
      findById: jest.fn(),
      findByProvider: jest.fn(),
      create: jest.fn(),
      bulkCreate: jest.fn(),
      delete: jest.fn(),
      deleteByProvider: jest.fn(),
    } as unknown as jest.Mocked<MassageServiceRepository>;

    mockPaymentRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      findByRazorpayOrderId: jest.fn(),
      createWalletTxn: jest.fn(),
      findWalletTxnsByProvider: jest.fn(),
      totalRevenue: jest.fn(),
    } as unknown as jest.Mocked<PaymentRepository>;

    bookingService = new BookingService(
      mockBookingRepo,
      mockProviderRepo,
      mockServiceRepo,
      mockPaymentRepo
    );
  });

  afterEach(() => jest.clearAllMocks());

  // ── createBooking ──────────────────────────────────────────────────
  describe('createBooking', () => {
    const mockProvider = {
      id: 10, status: 'approved', userId: 2,
    } as any;

    const mockService = {
      id: 5, providerId: 10, price: 500, name: 'Neonatal Massage',
    } as any;

    const mockBooking = {
      id: 99, customerId: 1, providerId: 10, serviceId: 5,
      amount: 500, status: 'pending',
    } as any;

    it('should create booking and Razorpay order successfully', async () => {
      mockProviderRepo.findById.mockResolvedValue(mockProvider);
      mockServiceRepo.findById.mockResolvedValue(mockService);
      mockBookingRepo.create.mockResolvedValue(mockBooking);
      mockPaymentRepo.create.mockResolvedValue({} as any);

      const result = await bookingService.createBooking(1, {
        providerId: 10,
        serviceId: 5,
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      });

      expect(result.booking.id).toBe(99);
      expect(result.orderId).toBe('order_test123');
      expect(result.amount).toBe(50000); // 500 * 100 paise
      expect(mockBookingRepo.create).toHaveBeenCalledTimes(1);
      expect(mockPaymentRepo.create).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundError when provider does not exist', async () => {
      mockProviderRepo.findById.mockResolvedValue(null);

      await expect(
        bookingService.createBooking(1, { providerId: 999, serviceId: 5, scheduledAt: new Date().toISOString() })
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it('should throw ValidationError when provider is not approved', async () => {
      mockProviderRepo.findById.mockResolvedValue({ ...mockProvider, status: 'pending' });

      await expect(
        bookingService.createBooking(1, { providerId: 10, serviceId: 5, scheduledAt: new Date().toISOString() })
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it('should throw NotFoundError when service does not exist', async () => {
      mockProviderRepo.findById.mockResolvedValue(mockProvider);
      mockServiceRepo.findById.mockResolvedValue(null);

      await expect(
        bookingService.createBooking(1, { providerId: 10, serviceId: 999, scheduledAt: new Date().toISOString() })
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it('should throw ValidationError when service belongs to a different provider', async () => {
      mockProviderRepo.findById.mockResolvedValue(mockProvider);
      mockServiceRepo.findById.mockResolvedValue({ ...mockService, providerId: 99 });

      await expect(
        bookingService.createBooking(1, { providerId: 10, serviceId: 5, scheduledAt: new Date().toISOString() })
      ).rejects.toMatchObject({ statusCode: 400 });
    });
  });
});
