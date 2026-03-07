/**
 * useAuth - auth state from store (no API call).
 */

import { useAuthStore } from '../stores/authStore';

export function useAuth() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  return {
    isAuthenticated: !!token,
    isLoading: false,
    user,
  };
}
