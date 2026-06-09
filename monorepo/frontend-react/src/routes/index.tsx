/**
 * Legacy Vite routes — redirect everything to Next.js (localhost:3000).
 */

import { Routes, Route } from 'react-router-dom';
import { WebAppRedirect } from '../components/WebAppRedirect';
import { ROUTES } from '../constants/routes';

interface Props {
  isAuthenticated: boolean;
  onLogin: (email: string, password: string) => void;
  onLogout: () => void;
  loginError: string | null;
  loginLoading: boolean;
}

export function AppRoutes(_props: Props) {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<WebAppRedirect path="/" />} />
      <Route path={ROUTES.FRANCHISE} element={<WebAppRedirect path="/about" />} />
      <Route path={ROUTES.PRICING} element={<WebAppRedirect path="/pricing" />} />
      <Route path={ROUTES.BLOG} element={<WebAppRedirect path="/blog" />} />
      <Route path={ROUTES.LOGIN} element={<WebAppRedirect path="/login" />} />
      <Route path={ROUTES.REGISTER} element={<WebAppRedirect path="/register" />} />
      <Route path={ROUTES.DASHBOARD} element={<WebAppRedirect path="/dashboard" />} />
      <Route path="/settings" element={<WebAppRedirect path="/settings" />} />
      <Route path="/features" element={<WebAppRedirect path="/features" />} />
      <Route path="/about" element={<WebAppRedirect path="/about" />} />
      <Route path="/contact" element={<WebAppRedirect path="/contact" />} />
      <Route path="*" element={<WebAppRedirect />} />
    </Routes>
  );
}
