"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Workflow = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  triggerType: string;
  version: number;
  updatedAt: string;
};

type Template = {
  id: string;
  name: string;
  description: string | null;
  category: string;
};

type Metrics = {
  totalRuns: number;
  successRate: number;
  avgDurationMs: number;
  failedRuns: number;
};

export function WorkflowsDashboardClient() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [wfRes, tplRes, metricsRes] = await Promise.all([
      fetch("/api/workflows"),
      fetch("/api/workflows/templates"),
      fetch("/api/workflows/metrics"),
    ]);
    const wfData = await wfRes.json();
    const tplData = await tplRes.json();
    const metricsData = await metricsRes.json();
    if (wfRes.ok) setWorkflows(wfData.workflows ?? []);
    if (tplRes.ok) setTemplates(tplData.templates ?? []);
    if (metricsRes.ok) setMetrics(metricsData.metrics ?? null);
  }, []);

  useEffect(() => {
    load().catch((e) => setError(e instanceof Error ? e.message : "Load failed"));
  }, [load]);

  async function createBlank() {
    const res = await fetch("/api/workflows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "New Workflow", triggerType: "manual" }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Create failed");
      return;
    }
    window.location.href = `/workflows/${data.workflow.id}`;
  }

  async function useTemplate(templateId: string) {
    const res = await fetch("/api/workflows/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateId }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Template failed");
      return;
    }
    window.location.href = `/workflows/${data.workflow.id}`;
  }

  return (
    <main style={{ padding: "2rem", maxWidth: 1100, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div>
          <Link href="/dashboard">← Dashboard</Link>
          <h1 style={{ marginTop: "0.5rem" }}>Workflows</h1>
          <p style={{ color: "var(--muted)" }}>Automate tasks with triggers, conditions, and actions.</p>
        </div>
        <button type="button" onClick={() => void createBlank()} style={{ alignSelf: "start" }}>
          New workflow
        </button>
      </header>

      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}

      {metrics && (
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          {[
            ["Total runs", metrics.totalRuns],
            ["Success rate", `${Math.round(metrics.successRate * 100)}%`],
            ["Avg duration", `${metrics.avgDurationMs}ms`],
            ["Failed", metrics.failedRuns],
          ].map(([label, value]) => (
            <div
              key={String(label)}
              style={{
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "1rem",
                background: "var(--surface)",
              }}
            >
              <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{label}</div>
              <div style={{ fontSize: "1.25rem", fontWeight: 600 }}>{value}</div>
            </div>
          ))}
        </section>
      )}

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>Your workflows</h2>
        {workflows.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No workflows yet.</p>
        ) : (
          <ul style={{ listStyle: "none", display: "grid", gap: "0.75rem" }}>
            {workflows.map((wf) => (
              <li
                key={wf.id}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: "1rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <Link href={`/workflows/${wf.id}`} style={{ fontWeight: 600 }}>
                    {wf.name}
                  </Link>
                  <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                    {wf.triggerType} · v{wf.version} · {wf.status}
                  </div>
                </div>
                <Link href={`/workflows/${wf.id}`}>Open builder →</Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>Templates</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
          {templates.map((tpl) => (
            <article
              key={tpl.id}
              style={{
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "1rem",
                background: "var(--surface)",
              }}
            >
              <h3 style={{ fontSize: "0.95rem" }}>{tpl.name}</h3>
              <p style={{ fontSize: "0.8rem", color: "var(--muted)", minHeight: 40 }}>
                {tpl.description}
              </p>
              <button type="button" onClick={() => void useTemplate(tpl.id)}>
                Use template
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
