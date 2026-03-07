/**
 * Market service - fetches markets list from API.
 */

import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../constants/api';
import type { Market } from '../types/market';
import type { PaginatedResponse } from '../types/api';

/**
 * Fetches list of active markets for tabs/filters.
 * @returns List of markets with pagination meta
 */
export async function fetchMarkets(): Promise<{ data: Market[]; meta: { total: number } }> {
  const res = await apiClient.get<PaginatedResponse<Market>>(API_ENDPOINTS.MARKETS);
  const data = res.data?.data ?? [];
  const meta = res.data?.meta ?? { page: 1, limit: data.length, total: data.length };
  return { data, meta: { total: meta.total } };
}
