"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type AgentInfo = {
  key: string;
  name: string;
  description: string;
  tools: string[];
  knowledgeScopes: string[];
};

type AgentRunSummary = {
  id: string;
  task: string;
  status: string;
  currentAgentKey: string | null;
  creditsUsed: number;
  startedAt: string;
  completedAt: string | null;
};

export function AgentsPageClient() {
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [runs, setRuns] = useState<AgentRunSummary[]>([]);
  const [task, setTask] = useState("");
  const [agentKey, setAgentKey] = useState("");
  const [routePreview, setRoutePreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [agentsRes, runsRes] = await Promise.all([
      fetch("/api/agents"),
      fetch("/api/agents/runs"),
    ]);
    const agentsData = await agentsRes.json();
    const runsData = await runsRes.json();
    if (agentsRes.ok) setAgents(agentsData.agents ?? []);
    if (runsRes.ok) setRuns(runsData.runs ?? []);
  }, []);

  useEffect(() => {
    load().catch(() => undefined);
  }, [load]);

  async function previewRoute() {
    if (!task.trim()) return;
    setError(null);
    const response = await fetch("/api/agents/route", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task, agentKey: agentKey || undefined }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Routing failed");
      return;
    }
    setRoutePreview(
      `${data.route.primary} (confidence ${Math.round(data.route.confidence * 100)}%) — ${data.route.reason}`,
    );
  }

  async function runTask(event: React.FormEvent) {
    event.preventDefault();
    if (!task.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch("/api/agents/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, agentKey: agentKey || undefined }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Run failed");
      setResult(data.run.content);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Run failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: "2rem", maxWidth: 960, margin: "0 auto" }}>
      <header style={{ marginBottom: "1.5rem" }}>
        <Link href="/dashboard" style={{ fontSize: "0.875rem" }}>
          ← Dashboard
        </Link>
        <h1 style={{ marginTop: "0.75rem" }}>AI Agents</h1>
        <p style={{ color: "var(--muted)" }}>
          Multi-agent system with supervisor routing, specialist agents, memory, and knowledge access.
        </p>
      </header>

      {error && <p style={{ color: "var(--danger)", marginBottom: "1rem" }}>{error}</p>}

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        {agents
          .filter((a) => a.key !== "supervisor")
          .map((agent) => (
            <article
              key={agent.key}
              style={{
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "1rem",
                background: "var(--surface)",
              }}
            >
              <h2 style={{ fontSize: "1rem" }}>{agent.name}</h2>
              <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: "0.35rem 0" }}>
                {agent.description}
              </p>
              <p style={{ fontSize: "0.75rem" }}>
                Tools: {agent.tools.join(", ") || "—"}
              </p>
              <p style={{ fontSize: "0.75rem" }}>
                KB: {agent.knowledgeScopes.join(", ") || "none"}
              </p>
            </article>
          ))}
      </section>

      <form
        onSubmit={(e) => void runTask(e)}
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "1.25rem",
          marginBottom: "1.5rem",
        }}
      >
        <h2 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>Run task</h2>
        <textarea
          value={task}
          onChange={(e) => setTask(e.target.value)}
          rows={4}
          placeholder="Describe a task for the agent system…"
          style={{
            width: "100%",
            padding: "0.75rem",
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "transparent",
            color: "inherit",
            marginBottom: "0.75rem",
          }}
        />
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
          <select
            value={agentKey}
            onChange={(e) => setAgentKey(e.target.value)}
            style={{
              padding: "0.5rem 0.75rem",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "transparent",
              color: "inherit",
            }}
          >
            <option value="">Auto-route (supervisor)</option>
            {agents
              .filter((a) => a.key !== "supervisor")
              .map((a) => (
                <option key={a.key} value={a.key}>
                  {a.name}
                </option>
              ))}
          </select>
          <button type="button" onClick={() => void previewRoute()}>
            Preview routing
          </button>
          <button type="submit" disabled={loading}>
            {loading ? "Running…" : "Run agents"}
          </button>
        </div>
        {routePreview && (
          <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>Route: {routePreview}</p>
        )}
        {result && (
          <div
            style={{
              marginTop: "1rem",
              padding: "1rem",
              borderRadius: 8,
              border: "1px solid var(--border)",
              whiteSpace: "pre-wrap",
              fontSize: "0.9rem",
            }}
          >
            {result}
          </div>
        )}
      </form>

      <section>
        <h2 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>Recent runs</h2>
        {runs.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No agent runs yet.</p>
        ) : (
          <ul style={{ listStyle: "none", display: "grid", gap: "0.5rem" }}>
            {runs.map((run) => (
              <li
                key={run.id}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: "0.75rem 1rem",
                  fontSize: "0.85rem",
                }}
              >
                <strong>{run.status}</strong> · {run.currentAgentKey ?? "—"} · {run.creditsUsed}{" "}
                credits
                <div style={{ color: "var(--muted)", marginTop: "0.25rem" }}>
                  {run.task.slice(0, 120)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
