/**
 * Admin service — business logic for admin operations.
 */

import { ProviderRepository } from '../repositories/providerRepository';
import { UserRepository } from '../repositories/userRepository';
import { BookingRepository } from '../repositories/bookingRepository';
import { PaymentRepository } from '../repositories/paymentRepository';
import { NotFoundError } from '../utils/errors';
import { ErrorMessages } from '../constants/errors';
import { ProviderModel } from '../models/ProviderModel';
import { UserModel } from '../models/UserModel';
import { AccountSettingRepository } from '../repositories/accountSettingRepository';
import { AccountSettingModel } from '../models/AccountSettingModel';

export class AdminService {
  constructor(
    private readonly providerRepo: ProviderRepository,
    private readonly userRepo: UserRepository,
    private readonly bookingRepo: BookingRepository,
    private readonly paymentRepo: PaymentRepository,
    private readonly accountSettingRepo: AccountSettingRepository
  ) {}

  async getDashboardStats(): Promise<{
    pendingProviders: number;
    approvedProviders: number;
    totalCustomers: number;
    totalBookings: number;
    totalRevenue: number;
  }> {
    const [pendingProviders, approvedProviders, totalCustomers, totalBookings, totalRevenue] =
      await Promise.all([
        this.providerRepo.count('pending'),
        this.providerRepo.count('approved'),
        this.userRepo.count(),
        this.bookingRepo.count(),
        this.paymentRepo.totalRevenue(),
      ]);

    return { pendingProviders, approvedProviders, totalCustomers, totalBookings, totalRevenue };
  }

  async listProviders(
    status: 'pending' | 'approved' | 'rejected',
    offset: number,
    limit: number
  ): Promise<Array<Record<string, unknown>>> {
    const providers = await this.providerRepo.findByStatus(status, offset, limit);
    const enriched = await Promise.all(
      providers.map(async (provider) => {
        const completedServicesCount = await this.bookingRepo.countCompletedByProvider(provider.id);
        return { ...provider.toJSON(), completedServicesCount };
      })
    );
    return enriched;
  }

  async approveProvider(id: number): Promise<ProviderModel> {
    const provider = await this.providerRepo.findById(id);
    if (!provider) throw new NotFoundError(ErrorMessages.PROVIDER_NOT_FOUND);
    if (!provider.registrationFeePaidAt) {
      throw new NotFoundError('Provider registration fee is not paid');
    }
    const updated = await this.providerRepo.update(id, {
      status: 'approved',
      serviceActiveSince: provider.serviceActiveSince ?? new Date(),
    });
    return updated!;
  }

  async rejectProvider(id: number): Promise<ProviderModel> {
    const provider = await this.providerRepo.findById(id);
    if (!provider) throw new NotFoundError(ErrorMessages.PROVIDER_NOT_FOUND);
    const updated = await this.providerRepo.update(id, { status: 'rejected' });
    return updated!;
  }

  async listUsers(
    offset: number,
    limit: number,
    filters?: {
      role?: 'provider' | 'customer' | 'admin';
      query?: string;
      includeDeleted?: boolean;
    }
  ): Promise<UserModel[]> {
    return this.userRepo.findAll(offset, limit, filters);
  }

  async updateUser(
    id: number,
    data: Partial<Pick<UserModel, 'name' | 'phone' | 'email' | 'role'>>
  ): Promise<UserModel> {
    const updated = await this.userRepo.update(id, data);
    if (!updated) throw new NotFoundError(ErrorMessages.USER_NOT_FOUND);
    return updated;
  }

  async softDeleteUser(id: number): Promise<void> {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundError(ErrorMessages.USER_NOT_FOUND);
    await this.userRepo.softDelete(id);
  }

  async restoreUser(id: number): Promise<void> {
    await this.userRepo.restore(id);
  }

  async getAccountSettings(): Promise<AccountSettingModel> {
    return this.accountSettingRepo.getOrCreateSingleton();
  }

  async updateAccountSettings(data: {
    razorpayKeyId?: string | null;
    razorpayKeySecret?: string | null;
    upiId?: string | null;
    codEnabled?: boolean;
  }): Promise<AccountSettingModel> {
    return this.accountSettingRepo.update(data);
  }

  async listBookings(offset: number, limit: number): Promise<unknown[]> {
    return this.bookingRepo.findAll(offset, limit);
  }

  async listPayments(offset: number, limit: number): Promise<unknown[]> {
    return this.paymentRepo.findAll(offset, limit);
  }

  async generateProviderCode(id: number): Promise<ProviderModel> {
    const provider = await this.providerRepo.findById(id);
    if (!provider) throw new NotFoundError(ErrorMessages.PROVIDER_NOT_FOUND);

    let code = '';
    let exists = true;
    while (exists) {
      code = `DDM${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      exists = !!(await this.providerRepo.findByProviderCode(code));
    }

    const updated = await this.providerRepo.update(id, { providerCode: code });
    return updated!;
  }

  async rewardAudit(offset: number, limit: number): Promise<unknown[]> {
    const payments = await this.paymentRepo.findAll(offset, limit);
    return payments.filter((p) => ['registration', 'service'].includes((p as { type?: string }).type ?? ''));
  }

  async getDashboardTrends(): Promise<{
    registrationsLast14Days: Array<{ day: string; count: number }>;
    monthlyRevenueLast6Months: Array<{ month: string; amount: number }>;
  }> {
    const [registrationsLast14Days, monthlyRevenueLast6Months] = await Promise.all([
      this.userRepo.registrationsLastDays(14),
      this.paymentRepo.monthlyRevenueLastMonths(6),
    ]);
    return { registrationsLast14Days, monthlyRevenueLast6Months };
  }
}
