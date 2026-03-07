import { useQuery } from '@tanstack/react-query';
import { fetchMarkets } from '../services/marketService';

/**
 * Fetches list of markets for Market Watch tabs.
 */
export function useMarkets() {
  const query = useQuery({
    queryKey: ['markets'],
    queryFn: () => fetchMarkets(),
    staleTime: 5 * 60 * 1000,
  });
  return {
    markets: query.data?.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
