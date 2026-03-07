import { useQuery } from '@tanstack/react-query';
import { tradeService } from '../services/tradeService';

export function useTrades(params: { page?: number; limit?: number; userId?: number; dateFrom?: string; dateTo?: string }) {
  const { page = 1, limit = 20, userId, dateFrom, dateTo } = params;
  const query = useQuery({
    queryKey: ['trades', page, limit, userId, dateFrom, dateTo],
    queryFn: () => tradeService.list({ page, limit, userId, dateFrom, dateTo }),
  });
  return {
    data: query.data?.data ?? [],
    meta: query.data?.meta ?? { page: 1, limit: 20, total: 0 },
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
