import { apiClient } from './apiClient';
import type { ApiResponse, PaginatedResponse } from '../types/api';

const BASE = '/api/v1/trades';

export interface TradeRow {
  id: number;
  orderId: number;
  userId: number;
  symbolId: number;
  side: string;
  quantity: unknown;
  price: unknown;
  brokerage: unknown;
  executedAt: string;
  symbol?: { code: string; name: string };
  user?: { id: number; email: string; username: string };
}

export const tradeService = {
  async list(params: { page?: number; limit?: number; userId?: number; orderId?: number; symbolId?: number; dateFrom?: string; dateTo?: string; sort?: string; order?: string }) {
    const res = await apiClient.get<PaginatedResponse<TradeRow>>(BASE, { params });
    if (!res.data.success || !Array.isArray(res.data.data)) throw new Error('Invalid response');
    return { data: res.data.data, meta: res.data.meta! };
  },
};
