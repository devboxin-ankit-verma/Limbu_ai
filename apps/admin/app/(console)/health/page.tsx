"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { cardStyle } from "@limbu/ui/layout/admin/admin-shell";

type Health = {
  status: string;
  database: { ok: boolean; latencyMs: number };
  queues: {
    workflow: { pending: number; failed: number };
    rag: { pending: number; failed: number };
    deadLetterOpen: number;
  };
  errors: { last24h: number; last7d: number };
  workflows: { successRate24h: number; totalRuns24h: number };
  checkedAt: string;
};

export default function AdminHealthPage() {
  const [health, setHealth] = useState<Health | null>(null);

  const load = useCallback(async () => {
    const res = await adminApi("/health");
    const data = await res.json();
    setHealth(data.health ?? null);
  }, []);

  useEffect(() => {
    void load();
    const id = setInterval(() => void load(), 30000);
    return () => clearInterval(id);
  }, [load]);

  if (!health) return <p style={{ color: "var(--muted)" }}>Checking system health…</p>;

  const statusColor =
    health.status === "healthy"
      ? "var(--success, green)"
      : health.status === "degraded"
        ? "orange"
        : "var(--danger, red)";

  return (
    <div>
      <h1 style={{ marginBottom: "0.5rem" }}>System Health</h1>
      <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
        Last checked {new Date(health.checkedAt).toLocaleString()} · auto-refresh 30s
      </p>

      <p style={{ color: statusColor, fontWeight: 600, textTransform: "capitalize", marginBottom: "1.5rem" }}>
        Status: {health.status}
      </p>

      <dl
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: "1rem",
        }}
      >
        {[
          ["Database", health.database.ok ? `OK (${health.database.latencyMs}ms)` : "DOWN"],
          ["Errors (24h)", health.errors.last24h],
          ["Errors (7d)", health.errors.last7d],
          ["WF queue pending", health.queues.workflow.pending],
          ["WF queue failed", health.queues.workflow.failed],
          ["RAG queue pending", health.queues.rag.pending],
          ["Dead letter (open)", health.queues.deadLetterOpen],
          ["Workflow success", `${(health.workflows.successRate24h * 100).toFixed(1)}%`],
          ["Workflow runs (24h)", health.workflows.totalRuns24h],
        ].map(([label, value]) => (
          <div key={String(label)} style={cardStyle}>
            <dt style={{ color: "var(--muted)", fontSize: "0.8rem" }}>{label}</dt>
            <dd style={{ fontSize: "1.1rem", fontWeight: 600, margin: "0.25rem 0 0" }}>{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
