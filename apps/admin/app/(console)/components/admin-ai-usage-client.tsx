"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { adminApi } from "@/lib/api";
import { cardStyle, tableStyle, tdStyle, thStyle } from "@limbu/ui/layout/admin/admin-shell";

type AiSummary = {
  totalTokens: number;
  totalCredits: number;
  totalCostUsd: number;
  byModel: Array<{
    model: string;
    tokens: number;
    credits: number;
    costUsd: number;
    requests: number;
  }>;
  byType: Array<{ type: string; credits: number; requests: number }>;
  dailyTokens: Array<{ date: string; value: number }>;
  dailyCost: Array<{ date: string; value: number }>;
};

export function AdminAiUsageClient() {
  const [ai, setAi] = useState<AiSummary | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi(`/analytics?days=${days}`);
      const data = await res.json();
      setAi((data.overview?.ai as AiSummary) ?? null);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <p style={{ color: "var(--muted)" }}>Loading…</p>;
  if (!ai) return <p>Unable to load AI usage analytics.</p>;

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>AI Usage</h1>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          style={{
            padding: "0.4rem 0.6rem",
            border: "1px solid var(--border)",
            borderRadius: 6,
            background: "var(--bg)",
            color: "var(--text)",
          }}
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      <section style={cardStyle}>
        <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Platform totals</h2>
        <dl
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "1rem",
            fontSize: "0.9rem",
          }}
        >
          <div>
            <dt style={{ color: "var(--muted)" }}>Total tokens</dt>
            <dd>{ai.totalTokens.toLocaleString()}</dd>
          </div>
          <div>
            <dt style={{ color: "var(--muted)" }}>Total credits</dt>
            <dd>{ai.totalCredits.toLocaleString()}</dd>
          </div>
          <div>
            <dt style={{ color: "var(--muted)" }}>Estimated cost (USD)</dt>
            <dd>${ai.totalCostUsd.toFixed(2)}</dd>
          </div>
        </dl>
      </section>

      <section style={cardStyle}>
        <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Usage by model</h2>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Model</th>
              <th style={thStyle}>Requests</th>
              <th style={thStyle}>Tokens</th>
              <th style={thStyle}>Credits</th>
              <th style={thStyle}>Cost (USD)</th>
            </tr>
          </thead>
          <tbody>
            {ai.byModel.map((row) => (
              <tr key={row.model}>
                <td style={tdStyle}>{row.model}</td>
                <td style={tdStyle}>{row.requests}</td>
                <td style={tdStyle}>{row.tokens.toLocaleString()}</td>
                <td style={tdStyle}>{row.credits.toLocaleString()}</td>
                <td style={tdStyle}>${row.costUsd.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={cardStyle}>
        <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Usage by type</h2>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Requests</th>
              <th style={thStyle}>Credits</th>
            </tr>
          </thead>
          <tbody>
            {ai.byType.map((row) => (
              <tr key={row.type}>
                <td style={tdStyle}>{row.type}</td>
                <td style={tdStyle}>{row.requests}</td>
                <td style={tdStyle}>{row.credits.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={cardStyle}>
        <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Daily trend</h2>
        <p style={{ fontSize: "0.875rem", color: "var(--muted)", marginBottom: "0.75rem" }}>
          Token volume and estimated cost per day (last {Math.min(days, 30)} days).
        </p>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Tokens</th>
              <th style={thStyle}>Cost (USD)</th>
            </tr>
          </thead>
          <tbody>
            {ai.dailyTokens.map((point, i) => (
              <tr key={point.date}>
                <td style={tdStyle}>{point.date}</td>
                <td style={tdStyle}>{point.value.toLocaleString()}</td>
                <td style={tdStyle}>${(ai.dailyCost[i]?.value ?? 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <Link href="/analytics" style={{ fontSize: "0.875rem" }}>
        View full platform analytics →
      </Link>
    </div>
  );
}
