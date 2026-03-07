/**
 * useAuth hook - logic only, no JSX.
 * 
 * This module contains ONLY logic and state management.
 * NO JSX/UI rendering, NO API calls (use Services).
 */

import { useState, useEffect } from 'react';
import { authService } from '../services/authService';

interface UseAuthResult {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
}

/**
 * Custom hook for managing authentication state.
 * 
 * This hook contains ONLY logic.
 * It uses Services for API calls.
 * It does NOT contain JSX.
 */
export const useAuth = (): UseAuthResult => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any | null>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authUser = await authService.getCurrentUser();
        setUser(authUser);
        setIsAuthenticated(!!authUser);
      } catch (error) {
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  return { isAuthenticated, isLoading, user };
};
