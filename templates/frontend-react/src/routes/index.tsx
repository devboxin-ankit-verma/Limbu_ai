/**
 * Route definitions - route definitions only.
 *
 * This module contains ONLY route definitions.
 * NO component logic, NO API calls, NO business logic.
 */

import { Route, Routes, Navigate } from 'react-router-dom';
import { MainLayout } from '../layout';
import { UserListPage } from '../pages/UserListPage';
import { UserDetailPage } from '../pages/UserDetailPage';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { ROUTES } from '../constants/routes';

/**
 * Application routes.
 *
 * All routing logic is centralized here.
 * MainLayout wraps all pages; pages handle composition, Components handle UI.
 */
export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Navigate to={ROUTES.USERS} replace />} />
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
      </Route>
    </Routes>
  );
};
