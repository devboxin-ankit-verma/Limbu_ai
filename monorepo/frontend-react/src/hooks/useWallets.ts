import { useQuery } from '@tanstack/react-query';
import { walletService } from '../services/walletService';

export function useWallets(userId: number | null) {
  const query = useQuery({
    queryKey: ['wallets', userId],
    queryFn: () => walletService.listByUser(userId!),
    enabled: !!userId,
  });
  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
