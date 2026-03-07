/**
 * Wallet repository - database access for wallets and ledger transactions.
 */

import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface WalletRecord {
  id: number;
  userId: number;
  currency: string;
  balance: Decimal;
  lockedBalance: Decimal;
  updatedAt: Date;
}

export interface TransactionRecord {
  id: number;
  walletId: number;
  type: string;
  amount: Decimal;
  refId: number | null;
  refType: string | null;
  metadata: unknown;
  createdAt: Date;
}

export class WalletRepository {
  constructor(private readonly db: PrismaClient) {}

  async findByUserId(userId: number): Promise<WalletRecord[]> {
    const rows = await this.db.wallet.findMany({
      where: { userId }
    });
    return rows as unknown as WalletRecord[];
  }

  async findById(id: number): Promise<WalletRecord | null> {
    const row = await this.db.wallet.findUnique({ where: { id } });
    return row as unknown as WalletRecord | null;
  }

  async findOrCreateForUser(userId: number, currency: string = 'INR'): Promise<WalletRecord> {
    let wallet = await this.db.wallet.findFirst({
      where: { userId, currency }
    });
    if (!wallet) {
      wallet = await this.db.wallet.create({
        data: { userId, currency, balance: 0, lockedBalance: 0 }
      });
    }
    return wallet as unknown as WalletRecord;
  }

  async updateBalance(walletId: number, balanceDelta: number, lockedDelta: number = 0): Promise<void> {
    await this.db.wallet.update({
      where: { id: walletId },
      data: {
        balance: { increment: balanceDelta },
        lockedBalance: { increment: lockedDelta }
      }
    });
  }

  async addTransaction(data: {
    walletId: number;
    type: string;
    amount: number;
    refId?: number | null;
    refType?: string | null;
    metadata?: unknown;
  }): Promise<TransactionRecord> {
    const row = await this.db.transaction.create({
      data: {
        walletId: data.walletId,
        type: data.type,
        amount: data.amount,
        refId: data.refId ?? null,
        refType: data.refType ?? null,
        metadata: data.metadata ?? undefined
      }
    });
    return row as unknown as TransactionRecord;
  }

  async listTransactions(
    walletId: number,
    options: { skip: number; limit: number; type?: string }
  ): Promise<{ data: TransactionRecord[]; total: number }> {
    const where: Record<string, unknown> = { walletId };
    if (options.type) where.type = options.type;
    const [data, total] = await Promise.all([
      this.db.transaction.findMany({
        where,
        skip: options.skip,
        take: options.limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.db.transaction.count({ where })
    ]);
    return { data: data as unknown as TransactionRecord[], total };
  }
}
