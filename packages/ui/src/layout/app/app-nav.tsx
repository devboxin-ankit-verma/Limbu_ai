"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type AppNavItem = {
  href: string;
  label: string;
  icon: string;
  match?: RegExp;
};

const NAV_ITEMS: AppNavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/posts", label: "Posts", icon: "✨", match: /^\/posts/ },
  { href: "/calendar", label: "Calendar", icon: "📅" },
  { href: "/reviews", label: "Reviews", icon: "⭐" },
  { href: "/locations", label: "Locations", icon: "📍" },
  { href: "/integrations", label: "Integrations", icon: "🔗" },
  { href: "/analytics/gmb", label: "Analytics", icon: "📈", match: /^\/analytics/ },
  { href: "/magic-qr", label: "Magic QR", icon: "📱" },
  { href: "/chat", label: "AI Chat", icon: "💬", match: /^\/chat/ },
  { href: "/workflows", label: "Workflows", icon: "⚡", match: /^\/workflows/ },
  { href: "/knowledge", label: "Knowledge", icon: "📚", match: /^\/knowledge/ },
];

const SECONDARY_ITEMS: AppNavItem[] = [
  { href: "/notifications", label: "Notifications", icon: "🔔" },
];

function isActive(pathname: string, item: AppNavItem) {
  if (item.match) return item.match.test(pathname);
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="app-nav">
      <div className="app-nav-brand">
        <Link href="/dashboard" className="app-nav-logo">
          <span className="app-nav-logo-icon">🍋</span>
          <span>Limbu</span>
        </Link>
      </div>

      <div className="app-nav-section">
        <span className="app-nav-section-label">Marketing</span>
        {NAV_ITEMS.slice(0, 8).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`app-nav-link${isActive(pathname, item) ? " active" : ""}`}
          >
            <span className="app-nav-icon">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>

      <div className="app-nav-section">
        <span className="app-nav-section-label">Automation</span>
        {NAV_ITEMS.slice(8).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`app-nav-link${isActive(pathname, item) ? " active" : ""}`}
          >
            <span className="app-nav-icon">{item.icon}</span>
            {item.label}
          </Link>
        ))}
        {SECONDARY_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`app-nav-link${isActive(pathname, item) ? " active" : ""}`}
          >
            <span className="app-nav-icon">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
