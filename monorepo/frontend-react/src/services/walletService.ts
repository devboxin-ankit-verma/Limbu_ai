import { apiClient } from './apiClient';
import type { ApiResponse, PaginatedResponse } from '../types/api';

export interface WalletRow {
  id: number;
  userId: number;
  currency: string;
  balance: unknown;
  lockedBalance: unknown;
  updatedAt: string;
}

export interface TransactionRow {
  id: number;
  walletId: number;
  type: string;
  amount: unknown;
  refId: number | null;
  refType: string | null;
  createdAt: string;
}

export const walletService = {
  async listByUser(userId: number) {
    const res = await apiClient.get<ApiResponse<WalletRow[]>>('/api/v1/wallets', { params: { userId } });
    if (!res.data.success || !Array.isArray(res.data.data)) throw new Error('Invalid response');
    return res.data.data;
  },
  async getTransactions(walletId: number, params: { page?: number; limit?: number; type?: string }) {
    const res = await apiClient.get<PaginatedResponse<TransactionRow>>(`/api/v1/wallets/${walletId}/transactions`, { params });
    if (!res.data.success || !Array.isArray(res.data.data)) throw new Error('Invalid response');
    return { data: res.data.data, meta: res.data.meta! };
  },
  async deposit(body: { userId: number; amount: number; currency?: string; reference?: string }) {
    const res = await apiClient.post<ApiResponse<WalletRow>>('/api/v1/wallets/deposit', body);
    if (!res.data.success || !res.data.data) throw new Error('Deposit failed');
    return res.data.data;
  },
  async withdraw(body: { userId: number; amount: number; currency?: string }) {
    const res = await apiClient.post<ApiResponse<WalletRow>>('/api/v1/wallets/withdraw', body);
    if (!res.data.success || !res.data.data) throw new Error('Withdraw failed');
    return res.data.data;
  },
};
