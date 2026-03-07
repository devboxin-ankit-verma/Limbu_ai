/**
 * useUsers hook - logic only, no JSX.
 * 
 * This module contains ONLY logic and state management.
 * NO JSX/UI rendering, NO API calls (use Services).
 */

import { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { User } from '../types/User';

interface UseUsersResult {
  users: User[];
  loading: boolean;
  error: Error | null;
}

/**
 * Custom hook for managing users list.
 * 
 * This hook contains ONLY logic.
 * It uses Services for API calls.
 * It does NOT contain JSX.
 */
export const useUsers = (): UseUsersResult => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await userService.getUsers();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch users'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  return { users, loading, error };
};
