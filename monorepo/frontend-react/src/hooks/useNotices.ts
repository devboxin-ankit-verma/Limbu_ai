import { useQuery } from '@tanstack/react-query';
import { noticeService } from '../services/noticeService';

export function useNotices(params: { page?: number; limit?: number }) {
  const { page = 1, limit = 20 } = params;
  const query = useQuery({
    queryKey: ['notices', page, limit],
    queryFn: () => noticeService.list({ page, limit }),
  });
  return {
    data: query.data?.data ?? [],
    meta: query.data?.meta ?? { page: 1, limit: 20, total: 0 },
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
