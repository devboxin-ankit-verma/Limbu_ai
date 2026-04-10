/**
 * Admin auth hook — tracks login state.
 */

import { useState, useCallback } from 'react';
import { adminLogin, adminLogout, getAdminToken } from '../services/authService';

export function useAuth() {
  const [token, setToken] = useState<string | null>(getAdminToken);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const t = await adminLogin(email, password);
      setToken(t);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Login failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    adminLogout();
    setToken(null);
  }, []);

  return { token, isAuthenticated: !!token, login, logout, error, loading };
}
