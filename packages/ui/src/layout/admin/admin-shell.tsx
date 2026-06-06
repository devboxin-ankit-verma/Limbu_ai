"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const DEFAULT_NAV = [
  { segment: "", label: "Dashboard", exact: true as const },
  { segment: "users", label: "Users", exact: false as const },
  { segment: "organizations", label: "Organizations", exact: false as const },
  { segment: "workspaces", label: "Workspaces", exact: false as const },
  { segment: "subscriptions", label: "Subscriptions", exact: false as const },
  { segment: "revenue", label: "Revenue", exact: false as const },
  { segment: "billing", label: "Billing", exact: false as const },
  { segment: "audit", label: "Audit Logs", exact: false as const },
  { segment: "feature-flags", label: "Feature Flags", exact: false as const },
  { segment: "health", label: "System Health", exact: false as const },
  { segment: "analytics", label: "Analytics", exact: false as const },
  { segment: "ai-usage", label: "AI Usage", exact: false as const },
] as const;

export function AdminShell({
  children,
  basePath = "/admin",
  backHref = "/dashboard",
  backLabel = "← Back to app",
}: {
  children: React.ReactNode;
  basePath?: string;
  backHref?: string;
  backLabel?: string;
}) {
  const pathname = usePathname();
  const nav = DEFAULT_NAV.map((item) => ({
    ...item,
    href: item.segment ? `${basePath}/${item.segment}` : basePath || "/",
  }));

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 4rem)", gap: 0 }}>
      <aside
        style={{
          width: 220,
          flexShrink: 0,
          borderRight: "1px solid var(--border)",
          padding: "1.5rem 0",
          background: "var(--surface)",
        }}
      >
        <div style={{ padding: "0 1rem 1rem", borderBottom: "1px solid var(--border)" }}>
          <Link href={nav[0].href} style={{ fontWeight: 600, fontSize: "0.95rem" }}>
            Platform Admin
          </Link>
          <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.25rem" }}>
            Super admin only
          </p>
        </div>
        <nav style={{ padding: "1rem 0" }}>
          {nav.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "block",
                  padding: "0.5rem 1rem",
                  fontSize: "0.875rem",
                  color: active ? "var(--text)" : "var(--muted)",
                  background: active ? "var(--bg)" : "transparent",
                  borderLeft: active ? "2px solid var(--text)" : "2px solid transparent",
                  textDecoration: "none",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div style={{ padding: "1rem", borderTop: "1px solid var(--border)" }}>
          <Link href={backHref} style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
            {backLabel}
          </Link>
        </div>
      </aside>
      <div style={{ flex: 1, padding: "2rem", maxWidth: 1100, overflow: "auto" }}>{children}</div>
    </div>
  );
}

export const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "0.875rem",
};

export const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "0.6rem 0.75rem",
  borderBottom: "1px solid var(--border)",
  color: "var(--muted)",
  fontWeight: 500,
};

export const tdStyle: React.CSSProperties = {
  padding: "0.6rem 0.75rem",
  borderBottom: "1px solid var(--border)",
};

export const btnStyle: React.CSSProperties = {
  padding: "0.35rem 0.75rem",
  border: "1px solid var(--border)",
  borderRadius: 6,
  background: "transparent",
  color: "var(--text)",
  cursor: "pointer",
  fontSize: "0.8rem",
};

export const cardStyle: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  padding: "1.25rem",
};
