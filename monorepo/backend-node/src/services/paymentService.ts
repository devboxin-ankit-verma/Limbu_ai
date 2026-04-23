/**
 * Payment service — Razorpay webhook verification and wallet crediting.
 */

import crypto from 'crypto';
import { config } from '../config';
import { PaymentRepository } from '../repositories/paymentRepository';
import { ProviderRepository } from '../repositories/providerRepository';
import { BookingRepository } from '../repositories/bookingRepository';
import { ValidationError } from '../utils/errors';
import { ErrorMessages } from '../constants/errors';

export class PaymentService {
  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly providerRepo: ProviderRepository,
    private readonly bookingRepo: BookingRepository
  ) {}

  verifyWebhookSignature(rawBody: string, razorpaySignature: string): boolean {
    const hmac = crypto.createHmac('sha256', config.razorpay.keySecret);
    hmac.update(rawBody);
    const digest = hmac.digest('hex');
    return digest === razorpaySignature;
  }

  async handleWebhookEvent(event: {
    event: string;
    payload: {
      payment: {
        entity: {
          id: string;
          order_id: string;
          amount: number;
          notes: Record<string, string>;
        };
      };
    };
  }): Promise<void> {
    if (event.event !== 'payment.captured') return;

    const paymentEntity = event.payload.payment.entity;
    const { order_id, id: razorpayPaymentId, notes } = paymentEntity;

    const paymentRecord = await this.paymentRepo.findByRazorpayOrderId(order_id);
    if (!paymentRecord || paymentRecord.status === 'paid') return;

    await this.paymentRepo.update(paymentRecord.id, {
      razorpayPaymentId,
      status: 'paid',
    });

    if (paymentRecord.type === 'registration') {
      await this.handleRegistrationPayment(paymentRecord.userId);
    } else if (paymentRecord.type === 'service' && paymentRecord.referenceId) {
      await this.handleServicePayment(paymentRecord.referenceId);
    }
  }

  private async handleRegistrationPayment(userId: number): Promise<void> {
    const provider = await this.providerRepo.findByUserId(userId);
    if (!provider) return;
    await this.providerRepo.update(provider.id, {
      registrationFeePaidAt: new Date(),
    });
  }

  private async handleServicePayment(bookingId: number): Promise<void> {
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) return;

    await this.bookingRepo.updateStatus(bookingId, 'confirmed');
  }
}
