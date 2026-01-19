/**
 * Protected route component - route guard only.
 * 
 * This module handles route protection logic.
 * It does NOT make API calls (use Services for auth checks).
 */

import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from './LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Protected route component.
 * 
 * This component guards routes that require authentication.
 * It uses hooks for auth state, not direct API calls.
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};
