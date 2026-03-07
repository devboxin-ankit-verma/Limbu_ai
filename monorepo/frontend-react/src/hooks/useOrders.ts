import { useQuery } from '@tanstack/react-query';
import { orderService } from '../services/orderService';

export function useOrders(params: { page?: number; limit?: number; status?: string }) {
  const { page = 1, limit = 20, status } = params;
  const query = useQuery({
    queryKey: ['orders', page, limit, status],
    queryFn: () => orderService.list({ page, limit, status }),
  });
  return {
    data: query.data?.data ?? [],
    meta: query.data?.meta ?? { page: 1, limit: 20, total: 0 },
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
