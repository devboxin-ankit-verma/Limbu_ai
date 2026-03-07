import { useQuery } from '@tanstack/react-query';
import { userService } from '../services/userService';

interface UseUsersListParams {
  page?: number;
  limit?: number;
  q?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  isActive?: boolean;
}

export function useUsersList(params: UseUsersListParams = {}) {
  const { page = 1, limit = 20, q, sort, order } = params;
  const query = useQuery({
    queryKey: ['users', page, limit, q, sort, order],
    queryFn: async () => {
      const res = await userService.getUsers({
        page,
        limit,
        q: q || undefined,
      });
      return res;
    },
  });
  const data = query.data?.data ?? [];
  const meta = query.data?.meta;
  return {
    data,
    meta: meta ?? { page: 1, limit: 20, total: 0 },
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
