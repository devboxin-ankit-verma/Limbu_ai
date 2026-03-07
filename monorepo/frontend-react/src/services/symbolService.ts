/**
 * Symbol service - fetches symbols (with optional quotes) from API.
 */

import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../constants/api';
import type { SymbolWithQuote } from '../types/market';
import type { PaginatedResponse } from '../types/api';

export interface ListSymbolsParams {
  page?: number;
  limit?: number;
  marketId?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  withQuotes?: boolean;
}

export interface ListSymbolsResult {
  data: SymbolWithQuote[];
  meta: { page: number; limit: number; total: number };
}

/**
 * Fetches paginated symbols, optionally with latest quote for market watch.
 */
export async function fetchSymbols(params: ListSymbolsParams): Promise<ListSymbolsResult> {
  const {
    page = 1,
    limit = 10,
    marketId,
    search,
    sort = 'code',
    order = 'asc',
    withQuotes = true,
  } = params;
  const query = new URLSearchParams();
  query.set('page', String(page));
  query.set('limit', String(limit));
  if (marketId != null) query.set('marketId', String(marketId));
  if (search && search.trim().length >= 3) query.set('q', search.trim());
  query.set('sort', sort);
  query.set('order', order);
  if (withQuotes) query.set('withQuotes', 'true');

  const res = await apiClient.get<PaginatedResponse<SymbolWithQuote>>(
    `${API_ENDPOINTS.SYMBOLS}?${query.toString()}`
  );
  const data = res.data?.data ?? [];
  const meta = res.data?.meta ?? { page: 1, limit: 10, total: 0 };
  return { data, meta };
}
