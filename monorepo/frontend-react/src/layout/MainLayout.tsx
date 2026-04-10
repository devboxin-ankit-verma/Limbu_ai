/**
 * Admin panel main layout — sidebar navigation + content area.
 */

import { NavLink, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { config } from '../config';

interface Props {
  onLogout: () => void;
}

const navItems = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/bookings', icon: '📅', label: 'Bookings' },
  { to: '/providers', icon: '💆', label: 'Providers' },
  { to: '/users', icon: '👥', label: 'Users' },
  { to: '/payments', icon: '💳', label: 'Payments' },
  { to: '/settings', icon: '⚙️', label: 'Settings' },
];

export default function MainLayout({ onLogout }: Props) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('admin_theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('admin_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="flex h-screen panel-shell overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 panel-sidebar flex flex-col shrink-0">
        <div className="p-5 border-b border-[#e7edf5]">
          <div className="flex items-center gap-2">
            <div>
              <p className="font-bold text-gray-800 text-sm">{config.appName}</p>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `panel-nav-item flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'active'
                    : 'text-gray-600 hover:bg-[#f3f7fd] hover:text-gray-900'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-[#e7edf5]">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <span>🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto panel-main">
        <div className="panel-topbar px-6 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Dai Massage - Admin Panel</p>
            <p className="text-sm font-semibold text-gray-800">Dashboard Overview</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="px-3 py-1 text-xs rounded-full border panel-toggle"
            >
              {theme === 'light' ? 'Dark' : 'Light'}
            </button>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">Admin User</p>
              <p className="text-xs text-gray-500">admin</p>
            </div>
          </div>
        </div>
        <div className="p-6 panel-content min-h-[calc(100vh-62px)]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
