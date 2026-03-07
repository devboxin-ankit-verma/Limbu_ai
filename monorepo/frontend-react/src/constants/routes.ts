/**
 * Route paths and route-related constants.
 */

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  LOGIN: '/login',
  REGISTER: '/register',
  MARKET_WATCH: '/market-watch',
  HISTORY: '/history',
  POSITIONS_ACTIVE: '/positions/active',
  POSITIONS_CLOSED: '/positions/closed',
  TRADING_CLIENTS: '/trading-clients',
  USER_DETAIL: (userId: string) => `/trading-clients/${userId}`,
  TRADING_CLIENT_DETAIL: (userId: string) => `/trading-clients/${userId}`,
  TRADER_FUNDS: '/trader-funds',
  TRADES: '/trades',
  PENDING_ORDERS: '/orders/pending',
  BROKERS: '/brokers',
  ACCOUNTANT: '/accountant',
  ACCOUNTS: '/accounts',
  NOTICE: '/notice',
  NOTIFICATIONS: '/notifications',
  REJECTION_LOGS: '/rejection-logs',
  PAY_IN_OUT: '/pay-in-out',
  REPORTS: '/reports',
  SETTINGS: '/settings',
  USERS: '/trading-clients',
} as const;

export const SIDEBAR_ITEMS: { path: string; label: string; icon: string; badgeKey?: string }[] = [
  { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: ROUTES.MARKET_WATCH, label: 'Market Watch', icon: 'Eye' },
  { path: ROUTES.HISTORY, label: 'History', icon: 'Clock' },
  { path: ROUTES.POSITIONS_ACTIVE, label: 'Active Positions', icon: 'TrendingUp' },
  { path: ROUTES.POSITIONS_CLOSED, label: 'Close Positions', icon: 'XCircle' },
  { path: ROUTES.TRADING_CLIENTS, label: 'Trading Clients', icon: 'Users' },
  { path: ROUTES.TRADER_FUNDS, label: 'Trader Funds', icon: 'Wallet' },
  { path: ROUTES.TRADES, label: 'Trades', icon: 'BarChart2' },
  { path: ROUTES.PENDING_ORDERS, label: 'Pending Orders', icon: 'Clock' },
  { path: ROUTES.BROKERS, label: 'Brokers', icon: 'Building2' },
  { path: ROUTES.ACCOUNTANT, label: 'Accountant', icon: 'Calculator' },
  { path: ROUTES.ACCOUNTS, label: 'Accounts', icon: 'BookOpen' },
  { path: ROUTES.NOTICE, label: 'Notice', icon: 'Bell' },
  { path: ROUTES.NOTIFICATIONS, label: 'Notifications', icon: 'BellRing', badgeKey: 'notifications' },
  { path: ROUTES.REJECTION_LOGS, label: 'Rejection Logs', icon: 'AlertTriangle' },
  { path: ROUTES.PAY_IN_OUT, label: 'Pay In / Pay Out', icon: 'ArrowLeftRight' },
  { path: ROUTES.REPORTS, label: 'Reports', icon: 'FileText' },
  { path: ROUTES.SETTINGS, label: 'Settings', icon: 'Settings' },
];

export function getPageTitle(pathname: string): string {
  const item = SIDEBAR_ITEMS.find((i) => i.path === pathname);
  return item ? item.label : 'Dashboard';
}
