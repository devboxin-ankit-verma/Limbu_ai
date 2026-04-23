/**
 * Provider service — business logic for provider profile and registration payment.
 */

import Razorpay from 'razorpay';
import { config } from '../config';
import { ProviderRepository } from '../repositories/providerRepository';
import { MassageServiceRepository } from '../repositories/serviceRepository';
import { PaymentRepository } from '../repositories/paymentRepository';
import { NotFoundError, ValidationError } from '../utils/errors';
import { ErrorMessages } from '../constants/errors';
import { ProviderModel } from '../models/ProviderModel';
import { PaymentModel } from '../models/PaymentModel';
import { ReviewRepository } from '../repositories/reviewRepository';
import { AccountSettingRepository } from '../repositories/accountSettingRepository';

const razorpay = new Razorpay({
  key_id: config.razorpay.keyId,
  key_secret: config.razorpay.keySecret,
});

export class ProviderService {
  constructor(
    private readonly providerRepo: ProviderRepository,
    private readonly serviceRepo: MassageServiceRepository,
    private readonly paymentRepo: PaymentRepository,
    private readonly reviewRepo: ReviewRepository,
    private readonly accountSettingRepo: AccountSettingRepository
  ) {}

  /** Returns the configured registration fee in rupees (from DB or env fallback). */
  private async getRegistrationFeeRupees(): Promise<number> {
    try {
      const setting = await this.accountSettingRepo.getOrCreateSingleton();
      return parseFloat(String(setting.registrationFee));
    } catch {
      return config.providerRegistrationFee / 100;
    }
  }

  async getProviderByUserId(userId: number): Promise<ProviderModel> {
    const provider = await this.providerRepo.findByUserId(userId);
    if (!provider) throw new NotFoundError(ErrorMessages.PROVIDER_NOT_FOUND);
    await this.applyContinuityBonusIfEligible(provider);
    return provider;
  }

  async getProviderById(id: number): Promise<ProviderModel> {
    const provider = await this.providerRepo.findById(id);
    if (!provider) throw new NotFoundError(ErrorMessages.PROVIDER_NOT_FOUND);
    return provider;
  }

  async setupProfile(
    userId: number,
    data: {
      bio: string;
      photos: string[];
      expertise: string[];
      services: Array<{
        name: string;
        description?: string;
        imageUrl?: string;
        price: number;
        durationMinutes: number;
      }>;
    }
  ): Promise<ProviderModel> {
    const provider = await this.providerRepo.findByUserId(userId);
    if (!provider) throw new NotFoundError(ErrorMessages.PROVIDER_NOT_FOUND);

    await this.providerRepo.update(provider.id, {
      bio: data.bio,
      photos: data.photos,
      expertise: data.expertise,
    });

    await this.serviceRepo.deleteByProvider(provider.id);
    if (data.services.length > 0) {
      await this.serviceRepo.bulkCreate(
        data.services.map((s) => ({ ...s, providerId: provider.id }))
      );
    }

    const updated = await this.providerRepo.findByUserId(userId);
    return updated!;
  }

  async createRegistrationOrder(userId: number): Promise<{ orderId: string; amount: number; currency: string }> {
    const provider = await this.providerRepo.findByUserId(userId);
    if (!provider) throw new NotFoundError(ErrorMessages.PROVIDER_NOT_FOUND);
    if (provider.registrationFeePaidAt) {
      throw new ValidationError('Registration fee already paid');
    }

    const feeRupees = await this.getRegistrationFeeRupees();
    const feePaise = Math.round(feeRupees * 100);

    const order = await razorpay.orders.create({
      amount: feePaise,
      currency: 'INR',
      receipt: `reg_${userId}_${Date.now()}`,
      notes: { type: 'registration', userId: String(userId) },
    });

    await this.paymentRepo.create({
      userId,
      type: 'registration',
      razorpayOrderId: order.id,
      amount: feeRupees,
      status: 'pending',
    });

    return {
      orderId: order.id,
      amount: feePaise,
      currency: 'INR',
    };
  }

  async completeRegistrationWithoutOnlinePayment(
    userId: number,
    paymentMethod: 'cod' | 'upi'
  ): Promise<{ success: true; paymentMethod: 'cod' | 'upi' }> {
    if (!config.allowDevPaymentBypass) {
      throw new ValidationError('Developer payment bypass is disabled');
    }

    const provider = await this.providerRepo.findByUserId(userId);
    if (!provider) throw new NotFoundError(ErrorMessages.PROVIDER_NOT_FOUND);
    if (provider.registrationFeePaidAt) {
      throw new ValidationError('Registration fee already marked as paid');
    }

    // Read fee from DB (admin-configurable); fallback to env.
    const feeInRupees = await this.getRegistrationFeeRupees();

    await this.paymentRepo.create({
      userId,
      type: 'registration',
      amount: feeInRupees,
      status: 'paid',
      razorpayOrderId: null,
      razorpayPaymentId: `manual_${paymentMethod}_${Date.now()}`,
    });

    await this.providerRepo.update(provider.id, {
      registrationFeePaidAt: new Date(),
      status: 'pending',
    });

    return { success: true, paymentMethod };
  }

  async getWalletHistory(userId: number): Promise<{ provider: ProviderModel; txns: unknown[] }> {
    const provider = await this.providerRepo.findByUserId(userId);
    if (!provider) throw new NotFoundError(ErrorMessages.PROVIDER_NOT_FOUND);
    await this.applyContinuityBonusIfEligible(provider);
    const updatedProvider = await this.providerRepo.findByUserId(userId);
    const txns = await this.paymentRepo.findWalletTxnsByProvider(provider.id);
    return { provider: updatedProvider ?? provider, txns };
  }

  async listApproved(offset: number, limit: number): Promise<ProviderModel[]> {
    return this.providerRepo.findApproved(offset, limit);
  }

  async updateDocuments(
    userId: number,
    data: { aadhaarUrl: string; passportPhotoUrl: string }
  ): Promise<ProviderModel> {
    const provider = await this.providerRepo.findByUserId(userId);
    if (!provider) throw new NotFoundError(ErrorMessages.PROVIDER_NOT_FOUND);
    const updated = await this.providerRepo.update(provider.id, data);
    return updated!;
  }

  async updateIdentityVisibility(userId: number, identityHidden: boolean): Promise<ProviderModel> {
    const provider = await this.providerRepo.findByUserId(userId);
    if (!provider) throw new NotFoundError(ErrorMessages.PROVIDER_NOT_FOUND);
    const updated = await this.providerRepo.update(provider.id, { identityHidden });
    return updated!;
  }

  async getProviderReviews(providerId: number, offset: number, limit: number): Promise<{
    avgRating: number;
    reviews: unknown[];
  }> {
    const provider = await this.providerRepo.findById(providerId);
    if (!provider) throw new NotFoundError(ErrorMessages.PROVIDER_NOT_FOUND);

    const [avgRating, reviews] = await Promise.all([
      this.reviewRepo.avgRatingByProvider(providerId),
      this.reviewRepo.findByProvider(providerId, offset, limit),
    ]);

    return { avgRating, reviews };
  }

  private async applyContinuityBonusIfEligible(provider: ProviderModel): Promise<void> {
    if (!provider.serviceActiveSince || provider.continuityBonusPaidAt) return;
    const fourYearsMs = 4 * 365 * 24 * 60 * 60 * 1000;
    const isEligible = Date.now() - new Date(provider.serviceActiveSince).getTime() >= fourYearsMs;
    if (!isEligible) return;

    await this.providerRepo.incrementWallet(provider.id, 5000);
    await this.paymentRepo.createWalletTxn({
      providerId: provider.id,
      amount: 5000,
      type: 'credit',
      note: '4-year continuity bonus',
    });
    await this.providerRepo.update(provider.id, {
      continuityBonusPaidAt: new Date(),
    });
  }
}
