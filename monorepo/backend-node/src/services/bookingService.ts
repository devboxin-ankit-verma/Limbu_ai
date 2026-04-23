/**
 * Booking service — business logic for creating and managing bookings.
 */

import Razorpay from 'razorpay';
import { config } from '../config';
import { BookingRepository } from '../repositories/bookingRepository';
import { ProviderRepository } from '../repositories/providerRepository';
import { MassageServiceRepository } from '../repositories/serviceRepository';
import { PaymentRepository } from '../repositories/paymentRepository';
import { NotFoundError, ValidationError } from '../utils/errors';
import { ErrorMessages } from '../constants/errors';
import { BookingModel } from '../models/BookingModel';
import { ReviewRepository } from '../repositories/reviewRepository';

const razorpay = new Razorpay({
  key_id: config.razorpay.keyId,
  key_secret: config.razorpay.keySecret,
});

export class BookingService {
  constructor(
    private readonly bookingRepo: BookingRepository,
    private readonly providerRepo: ProviderRepository,
    private readonly serviceRepo: MassageServiceRepository,
    private readonly paymentRepo: PaymentRepository,
    private readonly reviewRepo: ReviewRepository
  ) {}

  async createBooking(
    customerId: number,
    data: { providerId: number; serviceId: number; scheduledAt: string; paymentMethod?: 'razorpay' | 'upi' | 'cod' }
  ): Promise<{ booking: BookingModel; orderId?: string; amount: number; currency: string; paymentMethod: string }> {
    const provider = await this.providerRepo.findById(data.providerId);
    if (!provider) throw new NotFoundError(ErrorMessages.PROVIDER_NOT_FOUND);
    if (provider.status !== 'approved') throw new ValidationError(ErrorMessages.PROVIDER_NOT_APPROVED);

    const service = await this.serviceRepo.findById(data.serviceId);
    if (!service) throw new NotFoundError(ErrorMessages.SERVICE_NOT_FOUND);
    if (service.providerId !== data.providerId) {
      throw new ValidationError('Service does not belong to this provider');
    }

    const booking = await this.bookingRepo.create({
      customerId,
      providerId: data.providerId,
      serviceId: data.serviceId,
      scheduledAt: new Date(data.scheduledAt),
      status: 'pending',
      amount: service.price,
    });

    const paymentMethod = data.paymentMethod || 'razorpay';
    const amountInPaise = Math.round(service.price * 100);

    if (paymentMethod !== 'razorpay') {
      if (!config.allowDevPaymentBypass) {
        throw new ValidationError('Manual payment methods are disabled');
      }
      await this.paymentRepo.create({
        userId: customerId,
        type: 'service',
        referenceId: booking.id,
        razorpayOrderId: null,
        razorpayPaymentId: `manual_${paymentMethod}_${Date.now()}`,
        amount: service.price,
        status: 'paid',
      });

      await this.bookingRepo.updateStatus(booking.id, 'confirmed');
      const confirmedBooking = await this.bookingRepo.findById(booking.id);
      return {
        booking: confirmedBooking || booking,
        amount: amountInPaise,
        currency: 'INR',
        paymentMethod,
      };
    }

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `bk_${booking.id}_${Date.now()}`,
      notes: { type: 'service', bookingId: String(booking.id), customerId: String(customerId) },
    });

    await this.paymentRepo.create({
      userId: customerId,
      type: 'service',
      referenceId: booking.id,
      razorpayOrderId: order.id,
      amount: service.price,
      status: 'pending',
    });

    return {
      booking,
      orderId: order.id,
      amount: amountInPaise,
      currency: 'INR',
      paymentMethod,
    };
  }

  async getCustomerBookings(
    customerId: number,
    offset: number,
    limit: number
  ): Promise<BookingModel[]> {
    return this.bookingRepo.findByCustomer(customerId, offset, limit);
  }

  async getProviderBookings(
    userId: number,
    offset: number,
    limit: number
  ): Promise<BookingModel[]> {
    const provider = await this.providerRepo.findByUserId(userId);
    if (!provider) throw new NotFoundError(ErrorMessages.PROVIDER_NOT_FOUND);
    return this.bookingRepo.findByProvider(provider.id, offset, limit);
  }

  async completeProviderBooking(userId: number, bookingId: number): Promise<BookingModel> {
    const provider = await this.providerRepo.findByUserId(userId);
    if (!provider) throw new NotFoundError(ErrorMessages.PROVIDER_NOT_FOUND);

    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) throw new NotFoundError(ErrorMessages.BOOKING_NOT_FOUND);
    if (booking.providerId !== provider.id) throw new ValidationError('Booking does not belong to you');
    if (booking.status !== 'confirmed') throw new ValidationError('Only confirmed bookings can be marked as completed');

    const existingWalletCredit = await this.paymentRepo.findWalletTxnByBooking(bookingId);
    if (existingWalletCredit) {
      throw new ValidationError('Wallet amount already credited for this booking');
    }

    await this.bookingRepo.updateStatus(bookingId, 'completed');
    await this.providerRepo.incrementWallet(provider.id, Number(booking.amount));
    await this.paymentRepo.createWalletTxn({
      providerId: provider.id,
      bookingId,
      amount: Number(booking.amount),
      type: 'credit',
      note: `Service completed — booking #${bookingId}`,
    });

    const updated = await this.bookingRepo.findById(bookingId);
    return updated!;
  }

  async addReview(
    customerId: number,
    data: { bookingId: number; rating: number; comment?: string }
  ): Promise<unknown> {
    const booking = await this.bookingRepo.findById(data.bookingId);
    if (!booking) throw new NotFoundError(ErrorMessages.BOOKING_NOT_FOUND);
    if (booking.customerId !== customerId) {
      throw new ValidationError('You can only review your own booking');
    }
    if (!['confirmed', 'completed'].includes(booking.status)) {
      throw new ValidationError('Review allowed only for confirmed/completed bookings');
    }

    return this.reviewRepo.create({
      bookingId: booking.id,
      providerId: booking.providerId,
      customerId,
      rating: data.rating,
      comment: data.comment || null,
    });
  }
}
