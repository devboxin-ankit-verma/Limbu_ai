import { apiClient } from './apiClient';
import type { ApiResponse } from '../types/api';

const BASE = '/api/v1/reports';

export const reportService = {
  async getTurnover(params: { dateFrom: string; dateTo: string; userId?: number; groupBy?: string }) {
    const res = await apiClient.get<ApiResponse<unknown[]>>(`${BASE}/turnover`, { params });
    if (!res.data.success || !res.data.data) throw new Error('Failed to fetch turnover');
    return res.data.data;
  },
  async getProfitLoss(params: { dateFrom: string; dateTo: string; userId?: number }) {
    const res = await apiClient.get<ApiResponse<unknown[]>>(`${BASE}/profit-loss`, { params });
    if (!res.data.success || !res.data.data) throw new Error('Failed to fetch P&L');
    return res.data.data;
  },
  async getBrokerage(params: { dateFrom: string; dateTo: string; userId?: number }) {
    const res = await apiClient.get<ApiResponse<{ totalBrokerage: number; count: number }>>(`${BASE}/brokerage`, { params });
    if (!res.data.success || !res.data.data) throw new Error('Failed to fetch brokerage');
    return res.data.data;
  },
};
