/**
 * Admin panel routes.
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import ProvidersPage from '../pages/ProvidersPage';
import UsersPage from '../pages/UsersPage';
import BookingsPage from '../pages/BookingsPage';
import PaymentsPage from '../pages/PaymentsPage';
import AccountSettingsPage from '../pages/AccountSettingsPage';

interface Props {
  isAuthenticated: boolean;
  onLogin: (email: string, password: string) => void;
  onLogout: () => void;
  loginError: string | null;
  loginLoading: boolean;
}

export function AppRoutes({ isAuthenticated, onLogin, onLogout, loginError, loginLoading }: Props) {
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route
          path="*"
          element={
            <LoginPage onLogin={onLogin} error={loginError} loading={loginLoading} />
          }
        />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<MainLayout onLogout={onLogout} />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/providers" element={<ProvidersPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/settings" element={<AccountSettingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
