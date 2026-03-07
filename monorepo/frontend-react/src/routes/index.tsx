import { Route, Routes, Navigate } from 'react-router-dom';
import { MainLayout } from '../layout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { ROUTES } from '../constants/routes';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { MarketWatchPage } from '../pages/MarketWatchPage';
import { HistoryPage } from '../pages/HistoryPage';
import { ActivePositionsPage } from '../pages/ActivePositionsPage';
import { ClosePositionsPage } from '../pages/ClosePositionsPage';
import { TradingClientsPage } from '../pages/TradingClientsPage';
import { TraderFundsPage } from '../pages/TraderFundsPage';
import { TradesPage } from '../pages/TradesPage';
import { PendingOrdersPage } from '../pages/PendingOrdersPage';
import { BrokersPage } from '../pages/BrokersPage';
import { AccountantPage } from '../pages/AccountantPage';
import { AccountsPage } from '../pages/AccountsPage';
import { NoticePage } from '../pages/NoticePage';
import { NotificationsPage } from '../pages/NotificationsPage';
import { RejectionLogsPage } from '../pages/RejectionLogsPage';
import { PayInOutPage } from '../pages/PayInOutPage';
import { ReportsPage } from '../pages/ReportsPage';
import { SettingsPage } from '../pages/SettingsPage';
import { UserDetailPage } from '../pages/UserDetailPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
        <Route path={ROUTES.MARKET_WATCH} element={<MarketWatchPage />} />
        <Route path={ROUTES.HISTORY} element={<HistoryPage />} />
        <Route path={ROUTES.POSITIONS_ACTIVE} element={<ActivePositionsPage />} />
        <Route path={ROUTES.POSITIONS_CLOSED} element={<ClosePositionsPage />} />
        <Route path={ROUTES.TRADING_CLIENTS} element={<TradingClientsPage />} />
        <Route path={`${ROUTES.TRADING_CLIENTS}/:userId`} element={<UserDetailPage />} />
        <Route path={ROUTES.TRADER_FUNDS} element={<TraderFundsPage />} />
        <Route path={ROUTES.TRADES} element={<TradesPage />} />
        <Route path={ROUTES.PENDING_ORDERS} element={<PendingOrdersPage />} />
        <Route path={ROUTES.BROKERS} element={<BrokersPage />} />
        <Route path={ROUTES.ACCOUNTANT} element={<AccountantPage />} />
        <Route path={ROUTES.ACCOUNTS} element={<AccountsPage />} />
        <Route path={ROUTES.NOTICE} element={<NoticePage />} />
        <Route path={ROUTES.NOTIFICATIONS} element={<NotificationsPage />} />
        <Route path={ROUTES.REJECTION_LOGS} element={<RejectionLogsPage />} />
        <Route path={ROUTES.PAY_IN_OUT} element={<PayInOutPage />} />
        <Route path={ROUTES.REPORTS} element={<ReportsPage />} />
        <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
    </Routes>
  );
}
