"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { cardStyle } from "@limbu/ui/layout/admin/admin-shell";

type Summary = {
  users: { total: number; superAdmins: number; active7d: number };
  organizations: { total: number; active: number; suspended: number };
  subscriptions: { active: number; trialing: number; cancelled30d: number };
  revenue: { mrr: number; arr: number; revenue30d: number };
  health: { status: string; errors24h: number };
};

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={cardStyle}>
      <dt style={{ color: "var(--muted)", fontSize: "0.8rem" }}>{label}</dt>
      <dd style={{ fontSize: "1.4rem", fontWeight: 600, margin: "0.25rem 0 0" }}>{value}</dd>
    </div>
  );
}

export function AdminDashboardClient() {
  const [summary, setSummary] = useState<Summary | null>(null);

  const load = useCallback(async () => {
    const res = await adminApi("/dashboard");
    const data = await res.json();
    setSummary(data.summary ?? null);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (!summary) return <p style={{ color: "var(--muted)" }}>Loading dashboard…</p>;

  const healthColor =
    summary.health.status === "healthy"
      ? "var(--success, green)"
      : summary.health.status === "degraded"
        ? "orange"
        : "var(--danger, red)";

  return (
    <div>
      <h1 style={{ marginBottom: "0.5rem" }}>Admin Dashboard</h1>
      <p style={{ color: "var(--muted)", marginBottom: "2rem" }}>
        Platform overview — users, revenue, and system health.
      </p>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1rem", marginBottom: "1rem" }}>System status</h2>
        <p style={{ color: healthColor, fontWeight: 500, textTransform: "capitalize" }}>
          {summary.health.status} · {summary.health.errors24h} errors (24h)
        </p>
      </section>

      <dl
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <Stat label="Total users" value={summary.users.total} />
        <Stat label="Super admins" value={summary.users.superAdmins} />
        <Stat label="Active users (7d)" value={summary.users.active7d} />
        <Stat label="Organizations" value={summary.organizations.total} />
        <Stat label="Active subs" value={summary.subscriptions.active} />
        <Stat label="MRR" value={`$${summary.revenue.mrr}`} />
        <Stat label="ARR" value={`$${summary.revenue.arr}`} />
        <Stat label="Revenue (30d)" value={`$${summary.revenue.revenue30d}`} />
      </dl>
    </div>
  );
}
