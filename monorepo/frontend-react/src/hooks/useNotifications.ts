import { useQuery } from '@tanstack/react-query';
import { notificationService } from '../services/notificationService';

export function useNotifications(params: { page?: number; limit?: number; read?: boolean }) {
  const { page = 1, limit = 20, read } = params;
  const query = useQuery({
    queryKey: ['notifications', page, limit, read],
    queryFn: () => notificationService.list({ page, limit, read }),
  });
  return {
    data: query.data?.data ?? [],
    meta: query.data?.meta ?? { page: 1, limit: 20, total: 0 },
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
