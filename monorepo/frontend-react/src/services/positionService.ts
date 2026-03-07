import { apiClient } from './apiClient';
import type { PaginatedResponse } from '../types/api';

const BASE = '/api/v1/positions';

export interface PositionRow {
  id: number;
  userId: number;
  symbolId: number;
  side: string;
  quantity: unknown;
  avgPrice: unknown;
  currentPrice: unknown;
  openedAt: string;
  closedAt: string | null;
  symbol?: { code: string; name: string };
}

export const positionService = {
  async list(params: { page?: number; limit?: number; userId?: number; symbolId?: number; status?: string; sort?: string; order?: string }) {
    const res = await apiClient.get<PaginatedResponse<PositionRow>>(BASE, { params });
    if (!res.data.success || !Array.isArray(res.data.data)) throw new Error('Invalid response');
    return { data: res.data.data, meta: res.data.meta! };
  },
};
