import { useQuery } from '@tanstack/react-query';
import { fetchDashboardStats } from '../services/dashboardService';

export function useDashboard() {
  const query = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardStats,
    staleTime: 60_000,
  });
  return {
    stats: query.data ?? {},
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
