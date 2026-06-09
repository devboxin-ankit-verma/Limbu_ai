import Link from "next/link";
import { AppNav } from "./app-nav";
import "./app-shell.css";

export function AppShell({
  children,
  userName,
  userEmail,
  organizationId,
  workspaceSwitcher,
  notificationBell,
  userMenu,
}: {
  children: React.ReactNode;
  userName?: string | null;
  userEmail?: string | null;
  organizationId?: string | null;
  workspaceSwitcher?: React.ReactNode;
  notificationBell?: React.ReactNode;
  userMenu?: React.ReactNode;
}) {
  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <AppNav />
        {organizationId && (
          <div className="app-sidebar-footer">
            <Link href={`/organizations/${organizationId}/settings`} className="app-nav-link">
              <span className="app-nav-icon">⚙️</span>
              Settings
            </Link>
            <Link href={`/organizations/${organizationId}/billing`} className="app-nav-link">
              <span className="app-nav-icon">💳</span>
              Billing
            </Link>
          </div>
        )}
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div className="app-topbar-left">{workspaceSwitcher}</div>
          <div className="app-topbar-right">
            {notificationBell}
            <div className="app-user-menu">
              <span className="app-user-name">{userName ?? userEmail ?? "User"}</span>
              {userMenu}
            </div>
          </div>
        </header>
        <div className="app-content">{children}</div>
      </div>
    </div>
  );
}
