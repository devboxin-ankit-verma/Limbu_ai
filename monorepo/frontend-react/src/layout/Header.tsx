import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, Sun, Moon, User, LogOut } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Avatar, AvatarFallback } from '../components/ui/avatar.tsx';
import { Button } from '../components/ui/button.tsx';
import { Input } from '../components/ui/input.tsx';
import { cn } from '../lib/utils';
import { getPageTitle } from '../constants/routes';
import { useThemeStore } from '../stores/themeStore';
import { useAuthStore } from '../stores';

const MARKET_FILTERS = ['NSE', 'MCX', 'FOREX', 'CRYPTO'];

interface HeaderProps {
  live?: boolean;
}

export function Header({ live = false }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const title = getPageTitle(location.pathname);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header
      className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-gray-700/50 px-4 py-2"
      style={{ backgroundColor: 'var(--bg-card)' }}
    >
      <div className="flex flex-1 items-center gap-4">
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h1>
        {live && (
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Live
          </span>
        )}
      </div>

      <div className="hidden flex-1 items-center justify-center gap-2 md:flex">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Search clients, trades..."
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {MARKET_FILTERS.map((m) => (
          <button
            key={m}
            type="button"
            className={cn(
              'rounded px-2 py-1 text-xs font-medium transition-colors',
              'border border-gray-600 text-gray-400 hover:border-accent hover:text-[var(--accent)]'
            )}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-black/5 dark:hover:bg-white/5"
            >
              <Avatar className="h-8 w-8 shrink-0 border-2 border-gray-300 dark:border-gray-600">
                <AvatarFallback
                  className="text-sm font-semibold text-white"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  {user?.name?.slice(0, 1) ?? user?.email?.slice(0, 1) ?? 'A'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-[var(--text-primary)]">Admin</span>
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content
            className="min-w-[10rem] rounded-lg border border-gray-700 bg-[var(--bg-card)] p-1 shadow-lg"
            align="end"
            sideOffset={4}
          >
            <DropdownMenu.Item
              className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm outline-none hover:bg-white/10"
              onSelect={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Log out
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}
