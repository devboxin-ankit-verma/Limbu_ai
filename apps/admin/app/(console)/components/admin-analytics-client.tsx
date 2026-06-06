"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { adminApi } from "@/lib/api";

export function AdminAnalyticsClient() {
  const [overview, setOverview] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi("/analytics?days=30");
      const data = await res.json();
      setOverview(data.overview ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <p style={{ color: "var(--muted)" }}>Loading…</p>;
  if (!overview) return <p>Unable to load platform analytics.</p>;

  const product = overview.product as {
    dau: number;
    wau: number;
    mau: number;
  };
  const business = overview.business as {
    mrr: number;
    arr: number;
    revenue30d: number;
    churnRate30d: number;
    activeSubscriptions: number;
  };
  const ai = overview.ai as { totalTokens: number; totalCostUsd: number };
  const obs = overview.observability as {
    errors: { total24h: number };
    workflows: { successRate: number };
  };

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <Link href="/" style={{ fontSize: "0.875rem" }}>
        ← Back to admin
      </Link>

      <section
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "1.5rem",
        }}
      >
        <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Platform overview</h2>
        <dl
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "1rem",
            fontSize: "0.9rem",
          }}
        >
          <div>
            <dt style={{ color: "var(--muted)" }}>DAU / WAU / MAU</dt>
            <dd>
              {product.dau} / {product.wau} / {product.mau}
            </dd>
          </div>
          <div>
            <dt style={{ color: "var(--muted)" }}>MRR / ARR</dt>
            <dd>
              ${business.mrr} / ${business.arr}
            </dd>
          </div>
          <div>
            <dt style={{ color: "var(--muted)" }}>Revenue (30d)</dt>
            <dd>${business.revenue30d}</dd>
          </div>
          <div>
            <dt style={{ color: "var(--muted)" }}>Active subscriptions</dt>
            <dd>{business.activeSubscriptions}</dd>
          </div>
          <div>
            <dt style={{ color: "var(--muted)" }}>Churn (30d)</dt>
            <dd>{(business.churnRate30d * 100).toFixed(1)}%</dd>
          </div>
          <div>
            <dt style={{ color: "var(--muted)" }}>AI tokens / cost</dt>
            <dd>
              {ai.totalTokens.toLocaleString()} / ${ai.totalCostUsd}
            </dd>
          </div>
          <div>
            <dt style={{ color: "var(--muted)" }}>Errors (24h)</dt>
            <dd>{obs.errors.total24h}</dd>
          </div>
          <div>
            <dt style={{ color: "var(--muted)" }}>Workflow success</dt>
            <dd>{(obs.workflows.successRate * 100).toFixed(1)}%</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
