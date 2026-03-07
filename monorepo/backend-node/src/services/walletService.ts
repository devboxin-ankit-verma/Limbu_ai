/**
 * Wallet service - business logic for deposits, withdrawals, ledger.
 */

import { WalletRepository } from '../repositories/walletRepository';
import { NotFoundError, ValidationError } from '../utils/errors';

export class WalletService {
  constructor(private readonly walletRepo: WalletRepository) {}

  async getWalletsByUserId(userId: number) {
    return this.walletRepo.findByUserId(userId);
  }

  async getWalletById(id: number) {
    const w = await this.walletRepo.findById(id);
    if (!w) throw new NotFoundError('Wallet not found');
    return w;
  }

  async deposit(userId: number, amount: number, currency: string = 'INR', reference?: string) {
    if (amount <= 0) throw new ValidationError('Amount must be positive');
    const wallet = await this.walletRepo.findOrCreateForUser(userId, currency);
    await this.walletRepo.updateBalance(wallet.id, amount, 0);
    await this.walletRepo.addTransaction({
      walletId: wallet.id,
      type: 'deposit',
      amount,
      refId: null,
      refType: null,
      metadata: reference ? { reference } : undefined
    });
    return this.walletRepo.findById(wallet.id);
  }

  async withdraw(userId: number, amount: number, currency: string = 'INR') {
    if (amount <= 0) throw new ValidationError('Amount must be positive');
    const wallet = await this.walletRepo.findOrCreateForUser(userId, currency);
    const balance = Number(wallet.balance);
    if (balance < amount) throw new ValidationError('Insufficient balance');
    await this.walletRepo.updateBalance(wallet.id, -amount, 0);
    await this.walletRepo.addTransaction({
      walletId: wallet.id,
      type: 'withdraw',
      amount: -amount
    });
    return this.walletRepo.findById(wallet.id);
  }

  async getTransactions(walletId: number, options: { skip: number; limit: number; type?: string }) {
    return this.walletRepo.listTransactions(walletId, options);
  }
}
