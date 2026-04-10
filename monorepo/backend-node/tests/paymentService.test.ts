/**
 * Unit tests for PaymentService — webhook verification and wallet crediting.
 */

import crypto from 'crypto';

jest.mock('../src/config', () => ({
  config: {
    razorpay: { keyId: 'rzp_test', keySecret: 'webhook_secret' },
  },
}));

import { PaymentService } from '../src/services/paymentService';
import { PaymentRepository } from '../src/repositories/paymentRepository';
import { ProviderRepository } from '../src/repositories/providerRepository';
import { BookingRepository } from '../src/repositories/bookingRepository';

const WEBHOOK_SECRET = 'webhook_secret';

function makeSignature(body: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(body).digest('hex');
}

describe('PaymentService', () => {
  let paymentService: PaymentService;
  let mockPaymentRepo: jest.Mocked<PaymentRepository>;
  let mockProviderRepo: jest.Mocked<ProviderRepository>;
  let mockBookingRepo: jest.Mocked<BookingRepository>;

  beforeEach(() => {
    mockPaymentRepo = {
      findByRazorpayOrderId: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      createWalletTxn: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findWalletTxnsByProvider: jest.fn(),
      totalRevenue: jest.fn(),
    } as unknown as jest.Mocked<PaymentRepository>;

    mockProviderRepo = {
      findByUserId: jest.fn(),
      update: jest.fn(),
      incrementWallet: jest.fn(),
      findById: jest.fn(),
      findApproved: jest.fn(),
      findByStatus: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<ProviderRepository>;

    mockBookingRepo = {
      findById: jest.fn(),
      updateStatus: jest.fn(),
      create: jest.fn(),
      findByCustomer: jest.fn(),
      findByProvider: jest.fn(),
      findAll: jest.fn(),
      count: jest.fn(),
    } as unknown as jest.Mocked<BookingRepository>;

    paymentService = new PaymentService(mockPaymentRepo, mockProviderRepo, mockBookingRepo);
  });

  afterEach(() => jest.clearAllMocks());

  // ── verifyWebhookSignature ─────────────────────────────────────────
  describe('verifyWebhookSignature', () => {
    it('should return true for a valid signature', () => {
      const body = JSON.stringify({ event: 'payment.captured' });
      const sig = makeSignature(body, WEBHOOK_SECRET);
      expect(paymentService.verifyWebhookSignature(body, sig)).toBe(true);
    });

    it('should return false for a tampered body', () => {
      const body = JSON.stringify({ event: 'payment.captured' });
      const sig = makeSignature('different_body', WEBHOOK_SECRET);
      expect(paymentService.verifyWebhookSignature(body, sig)).toBe(false);
    });

    it('should return false for wrong secret', () => {
      const body = JSON.stringify({ event: 'payment.captured' });
      const sig = makeSignature(body, 'wrong_secret');
      expect(paymentService.verifyWebhookSignature(body, sig)).toBe(false);
    });
  });

  // ── handleWebhookEvent — registration payment ─────────────────────
  describe('handleWebhookEvent - registration', () => {
    const event = {
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_test123',
            order_id: 'order_reg001',
            amount: 99900,
            notes: { type: 'registration', userId: '5' },
          },
        },
      },
    };

    it('should mark payment as paid and set registrationFeePaidAt', async () => {
      mockPaymentRepo.findByRazorpayOrderId.mockResolvedValue({
        id: 1, type: 'registration', userId: 5, status: 'pending',
        referenceId: null, amount: 999,
      } as any);
      mockPaymentRepo.update.mockResolvedValue({} as any);
      mockProviderRepo.findByUserId.mockResolvedValue({ id: 10 } as any);
      mockProviderRepo.update.mockResolvedValue({} as any);

      await paymentService.handleWebhookEvent(event);

      expect(mockPaymentRepo.update).toHaveBeenCalledWith(1, {
        razorpayPaymentId: 'pay_test123',
        status: 'paid',
      });
      expect(mockProviderRepo.update).toHaveBeenCalledWith(10, {
        registrationFeePaidAt: expect.any(Date),
      });
    });

    it('should skip already-paid payments (idempotency)', async () => {
      mockPaymentRepo.findByRazorpayOrderId.mockResolvedValue({
        id: 1, type: 'registration', userId: 5, status: 'paid',
      } as any);

      await paymentService.handleWebhookEvent(event);

      expect(mockPaymentRepo.update).not.toHaveBeenCalled();
    });
  });

  // ── handleWebhookEvent — service booking payment ──────────────────
  describe('handleWebhookEvent - service booking', () => {
    const event = {
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_svc456',
            order_id: 'order_svc001',
            amount: 50000,
            notes: { type: 'service', bookingId: '99' },
          },
        },
      },
    };

    it('should confirm booking and credit provider wallet', async () => {
      mockPaymentRepo.findByRazorpayOrderId.mockResolvedValue({
        id: 2, type: 'service', userId: 1, status: 'pending',
        referenceId: 99, amount: 500,
      } as any);
      mockPaymentRepo.update.mockResolvedValue({} as any);
      mockBookingRepo.findById.mockResolvedValue({ id: 99, providerId: 10 } as any);
      mockBookingRepo.updateStatus.mockResolvedValue({} as any);
      mockProviderRepo.incrementWallet.mockResolvedValue();
      mockPaymentRepo.createWalletTxn.mockResolvedValue({} as any);

      await paymentService.handleWebhookEvent(event);

      expect(mockBookingRepo.updateStatus).toHaveBeenCalledWith(99, 'confirmed');
      expect(mockProviderRepo.incrementWallet).toHaveBeenCalledWith(10, 500);
      expect(mockPaymentRepo.createWalletTxn).toHaveBeenCalledWith({
        providerId: 10,
        bookingId: 99,
        amount: 500,
        type: 'credit',
        note: 'Booking #99 confirmed',
      });
    });
  });

  // ── handleWebhookEvent — non-capture events ────────────────────────
  describe('handleWebhookEvent - ignored events', () => {
    it('should do nothing for non-payment.captured events', async () => {
      await paymentService.handleWebhookEvent({
        event: 'payment.failed',
        payload: { payment: { entity: { id: '', order_id: '', amount: 0, notes: {} } } },
      });

      expect(mockPaymentRepo.findByRazorpayOrderId).not.toHaveBeenCalled();
    });
  });
});
