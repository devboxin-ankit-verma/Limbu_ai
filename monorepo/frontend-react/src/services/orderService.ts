import { apiClient } from './apiClient';
import type { ApiResponse, PaginatedResponse } from '../types/api';

const BASE = '/api/v1/orders';

export interface OrderRow {
  id: number;
  userId: number;
  symbolId: number;
  side: string;
  type: string;
  quantity: unknown;
  price: unknown;
  status: string;
  filledQty: unknown;
  createdAt: string;
  updatedAt: string;
  symbol?: { code: string; name: string };
  user?: { id: number; email: string; username: string };
}

export const orderService = {
  async list(params: { page?: number; limit?: number; userId?: number; symbolId?: number; status?: string; sort?: string; order?: string }) {
    const res = await apiClient.get<PaginatedResponse<OrderRow>>(BASE, { params });
    if (!res.data.success || !Array.isArray(res.data.data)) throw new Error('Invalid response');
    return { data: res.data.data, meta: res.data.meta! };
  },
};
