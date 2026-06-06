"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Overview = {
  product: {
    dau: number;
    wau: number;
    mau: number;
    dauTrend: Array<{ date: string; value: number }>;
    retention: { day1: number; day7: number; day30: number; cohortSize: number };
    featureUsage: Array<{ feature: string; count: number; uniqueUsers: number }>;
  };
  ai: {
    totalTokens: number;
    totalCredits: number;
    totalCostUsd: number;
    byModel: Array<{ model: string; tokens: number; credits: number; costUsd: number; requests: number }>;
    dailyTokens: Array<{ date: string; value: number }>;
  };
  business?: {
    mrr: number;
    arr: number;
    revenue30d: number;
    churnRate30d: number;
    planBreakdown: Array<{ plan: string; count: number; mrr: number }>;
  };
  observability: {
    errors: { total24h: number; total7d: number; bySource: Array<{ source: string; count: number }> };
    latency: { p50Ms: number; p95Ms: number; p99Ms: number };
    queues: {
      workflow: { pending: number; processing: number; failed: number };
      rag: { pending: number; processing: number; failed: number };
      deadLetter: { open: number };
    };
    workflows: { totalRuns24h: number; failedRuns24h: number; successRate: number; avgDurationMs: number };
  };
};

function pct(n: number) {
  return `${(n * 100).toFixed(1)}%`;
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "1rem",
      }}
    >
      <dt style={{ color: "var(--muted)", fontSize: "0.8rem", marginBottom: "0.25rem" }}>{label}</dt>
      <dd style={{ fontSize: "1.5rem", fontWeight: 600, margin: 0 }}>{value}</dd>
    </div>
  );
}

export function AnalyticsClient({ organizationId }: { organizationId: string }) {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/organizations/${organizationId}/analytics?days=${days}`);
      const data = await res.json();
      setOverview(data.overview ?? null);
    } finally {
      setLoading(false);
    }
  }, [organizationId, days]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <p style={{ color: "var(--muted)" }}>Loading analytics…</p>;
  if (!overview) return <p>Unable to load analytics.</p>;

  return (
    <div style={{ display: "grid", gap: "2rem" }}>
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <label style={{ fontSize: "0.875rem", color: "var(--muted)" }}>Period</label>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          style={{
            padding: "0.35rem 0.5rem",
            borderRadius: 6,
            border: "1px solid var(--border)",
            background: "var(--bg)",
            color: "var(--text)",
          }}
        >
          <option value={7}>7 days</option>
          <option value={30}>30 days</option>
          <option value={90}>90 days</option>
        </select>
      </div>

      <section>
        <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Product analytics</h2>
        <dl
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: "1rem",
          }}
        >
          <Stat label="DAU" value={overview.product.dau} />
          <Stat label="WAU" value={overview.product.wau} />
          <Stat label="MAU" value={overview.product.mau} />
          <Stat label="Day-1 retention" value={pct(overview.product.retention.day1)} />
          <Stat label="Day-7 retention" value={pct(overview.product.retention.day7)} />
        </dl>
      </section>

      {overview.business && (
        <section>
          <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Business analytics</h2>
          <dl
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: "1rem",
            }}
          >
            <Stat label="MRR" value={`$${overview.business.mrr}`} />
            <Stat label="ARR" value={`$${overview.business.arr}`} />
            <Stat label="Revenue (30d)" value={`$${overview.business.revenue30d}`} />
            <Stat label="Churn (30d)" value={pct(overview.business.churnRate30d)} />
          </dl>
        </section>
      )}

      <section>
        <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>AI analytics</h2>
        <dl
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: "1rem",
            marginBottom: "1rem",
          }}
        >
          <Stat label="Total tokens" value={overview.ai.totalTokens.toLocaleString()} />
          <Stat label="Credits used" value={overview.ai.totalCredits.toLocaleString()} />
          <Stat label="Est. cost (USD)" value={`$${overview.ai.totalCostUsd}`} />
        </dl>
        {overview.ai.byModel.length > 0 && (
          <table style={{ width: "100%", fontSize: "0.875rem", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left" }}>
                <th style={{ padding: "0.5rem" }}>Model</th>
                <th style={{ padding: "0.5rem" }}>Requests</th>
                <th style={{ padding: "0.5rem" }}>Credits</th>
                <th style={{ padding: "0.5rem" }}>Cost</th>
              </tr>
            </thead>
            <tbody>
              {overview.ai.byModel.slice(0, 8).map((m) => (
                <tr key={m.model} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "0.5rem" }}>{m.model}</td>
                  <td style={{ padding: "0.5rem" }}>{m.requests}</td>
                  <td style={{ padding: "0.5rem" }}>{m.credits}</td>
                  <td style={{ padding: "0.5rem" }}>${m.costUsd}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Observability</h2>
        <dl
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: "1rem",
            marginBottom: "1rem",
          }}
        >
          <Stat label="Errors (24h)" value={overview.observability.errors.total24h} />
          <Stat label="Latency p50" value={`${overview.observability.latency.p50Ms}ms`} />
          <Stat label="Latency p95" value={`${overview.observability.latency.p95Ms}ms`} />
          <Stat label="Workflow success" value={pct(overview.observability.workflows.successRate)} />
          <Stat label="WF queue pending" value={overview.observability.queues.workflow.pending} />
          <Stat label="RAG queue pending" value={overview.observability.queues.rag.pending} />
          <Stat label="Dead letter (open)" value={overview.observability.queues.deadLetter.open} />
        </dl>
      </section>

      {overview.product.featureUsage.length > 0 && (
        <section>
          <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Feature usage</h2>
          <ul style={{ listStyle: "none", padding: 0, fontSize: "0.875rem" }}>
            {overview.product.featureUsage.slice(0, 10).map((f) => (
              <li
                key={f.feature}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0.5rem 0",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <span>{f.feature}</span>
                <span style={{ color: "var(--muted)" }}>
                  {f.count} events · {f.uniqueUsers} users
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Link href={`/organizations/${organizationId}/settings`} style={{ fontSize: "0.875rem" }}>
        ← Back to settings
      </Link>
    </div>
  );
}
