/**
 * useUser hook - logic only, no JSX.
 * 
 * This module contains ONLY logic and state management.
 * NO JSX/UI rendering, NO API calls (use Services).
 */

import { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { User } from '../types/User';

interface UseUserResult {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Custom hook for managing a single user.
 * 
 * This hook contains ONLY logic.
 * It uses Services for API calls.
 * It does NOT contain JSX.
 */
export const useUser = (userId: string): UseUserResult => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await userService.getUserById(userId);
        setUser(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch user'));
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchUser();
    }
  }, [userId]);
  
  return { user, loading, error };
};
