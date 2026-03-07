import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useThemeStore } from '../stores/themeStore';
import { useSocket } from '../contexts/SocketContext';
import { useNotifications } from '../hooks/useNotifications';

export function MainLayout() {
  const sidebarCollapsed = useThemeStore((s) => s.sidebarCollapsed);
  const socketConnected = useSocket()?.connected ?? false;
  const { meta: notifMeta } = useNotifications({ page: 1, limit: 1, read: false });
  const notificationCount = notifMeta?.total ?? 0;

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--bg-main)' }}>
      <Sidebar notificationCount={notificationCount} />
      <div
        className="flex flex-1 flex-col transition-[margin] duration-200"
        style={{ marginLeft: sidebarCollapsed ? '4rem' : '14rem' }}
      >
        <Header live={socketConnected} />
        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
