import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Eye,
  Clock,
  TrendingUp,
  XCircle,
  Users,
  Wallet,
  BarChart2,
  Building2,
  Calculator,
  BookOpen,
  Bell,
  BellRing,
  AlertTriangle,
  ArrowLeftRight,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { SIDEBAR_ITEMS } from '../constants/routes';
import { useThemeStore } from '../stores/themeStore';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Eye,
  Clock,
  TrendingUp,
  XCircle,
  Users,
  Wallet,
  BarChart2,
  Building2,
  Calculator,
  BookOpen,
  Bell,
  BellRing,
  AlertTriangle,
  ArrowLeftRight,
  FileText,
  Settings,
};

interface SidebarProps {
  notificationCount?: number;
}

export function Sidebar({ notificationCount = 0 }: SidebarProps) {
  const collapsed = useThemeStore((s) => s.sidebarCollapsed);
  const setCollapsed = useThemeStore((s) => s.setSidebarCollapsed);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-gray-700/50 bg-[var(--bg-sidebar)] transition-all duration-200',
        collapsed ? 'w-[4rem]' : 'w-56'
      )}
      style={{ backgroundColor: 'var(--bg-sidebar)' }}
    >
      <div className="flex h-14 items-center gap-2 border-b border-gray-700/40 px-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20 text-[var(--accent)]">
          <BarChart2 className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-wide text-[var(--text-primary)]">
              Share-Market
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">Trading dashboard</span>
          </div>
        )}
      </div>
      <nav className="scrollbar-hide flex flex-1 flex-col gap-1 overflow-y-auto p-2 pt-3">
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = iconMap[item.icon] ?? LayoutDashboard;
          const badge = item.badgeKey === 'notifications' ? notificationCount : undefined;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent/20 text-[var(--accent)]'
                    : 'text-[var(--text-primary)] opacity-80 hover:bg-white/5 hover:opacity-100',
                  collapsed && 'justify-center px-2'
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  {badge !== undefined && badge > 0 && (
                    <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                      {badge > 99 ? '99+' : badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
      <button
        type="button"
        onClick={() => setCollapsed?.(!collapsed)}
        className="absolute -right-3 top-6 flex h-6 w-6 items-center justify-center rounded-full border border-gray-600 bg-[var(--bg-sidebar)] text-gray-400 hover:bg-white/10 hover:text-white"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </aside>
  );
}
