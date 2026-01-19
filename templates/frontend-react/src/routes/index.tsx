/**
 * Route definitions - route definitions only.
 * 
 * This module contains ONLY route definitions.
 * NO component logic, NO API calls, NO business logic.
 */

import { Route, Routes } from 'react-router-dom';
import { UserListPage } from '../pages/UserListPage';
import { UserDetailPage } from '../pages/UserDetailPage';
import { ProtectedRoute } from '../components/ProtectedRoute';

/**
 * Application routes.
 * 
 * All routing logic is centralized here.
 * Pages handle composition, Components handle UI, Services handle API calls.
 */
export const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <UserListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/:userId"
        element={
          <ProtectedRoute>
            <UserDetailPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};
