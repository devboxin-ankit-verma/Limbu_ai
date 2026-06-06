"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { cardStyle } from "@limbu/ui/layout/admin/admin-shell";

type Revenue = {
  mrr: number;
  arr: number;
  revenue30d: number;
  churnRate30d: number;
  activeSubscriptions: number;
  cancelled30d: number;
  planBreakdown: Array<{ plan: string; count: number; mrr: number }>;
  revenueTrend: Array<{ date: string; value: number }>;
};

export default function AdminRevenuePage() {
  const [revenue, setRevenue] = useState<Revenue | null>(null);

  const load = useCallback(async () => {
    const res = await adminApi("/revenue?days=30");
    const data = await res.json();
    setRevenue(data.revenue ?? null);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (!revenue) return <p style={{ color: "var(--muted)" }}>Loading revenue…</p>;

  return (
    <div>
      <h1 style={{ marginBottom: "1rem" }}>Revenue Dashboard</h1>
      <dl
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        {[
          ["MRR", `$${revenue.mrr}`],
          ["ARR", `$${revenue.arr}`],
          ["Revenue (30d)", `$${revenue.revenue30d}`],
          ["Churn (30d)", `${(revenue.churnRate30d * 100).toFixed(1)}%`],
          ["Active subs", revenue.activeSubscriptions],
          ["Cancelled (30d)", revenue.cancelled30d],
        ].map(([label, value]) => (
          <div key={String(label)} style={cardStyle}>
            <dt style={{ color: "var(--muted)", fontSize: "0.8rem" }}>{label}</dt>
            <dd style={{ fontSize: "1.25rem", fontWeight: 600, margin: "0.25rem 0 0" }}>{value}</dd>
          </div>
        ))}
      </dl>

      <h2 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>Plan breakdown</h2>
      <ul style={{ listStyle: "none", padding: 0, fontSize: "0.875rem" }}>
        {revenue.planBreakdown.map((p) => (
          <li
            key={p.plan}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "0.5rem 0",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <span style={{ textTransform: "capitalize" }}>{p.plan}</span>
            <span>
              {p.count} orgs · ${p.mrr} MRR
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
