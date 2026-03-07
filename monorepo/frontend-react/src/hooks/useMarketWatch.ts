import { useQuery } from '@tanstack/react-query';
import { fetchSymbols, type ListSymbolsParams } from '../services/symbolService';

/**
 * Fetches symbols with quotes for Market Watch table.
 * Refetches when marketId, page, search, sort, or order change.
 */
export function useMarketWatch(params: ListSymbolsParams) {
  const query = useQuery({
    queryKey: ['marketWatch', params],
    queryFn: () => fetchSymbols(params),
    staleTime: 10 * 1000,
    enabled: true,
  });
  return {
    data: query.data?.data ?? [],
    meta: query.data?.meta ?? { page: 1, limit: 10, total: 0 },
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
