"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type WorkflowNode = {
  id: string;
  type: string;
  kind: string;
  label?: string;
  config: Record<string, unknown>;
};

type Workflow = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  triggerType: string;
  webhookSecret: string | null;
  version: number;
  definition: { nodes: WorkflowNode[]; edges: unknown[]; variables?: Record<string, unknown> };
};

type Run = {
  id: string;
  status: string;
  startedAt: string;
  durationMs: number | null;
};

const ACTION_TYPES = [
  "run_agent",
  "send_email",
  "send_notification",
  "call_api",
  "update_database",
  "create_document",
  "execute_workflow",
  "set_variable",
];

export function WorkflowBuilderClient({ workflowId }: { workflowId: string }) {
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const [wfRes, runsRes] = await Promise.all([
      fetch(`/api/workflows/${workflowId}`),
      fetch(`/api/workflows/${workflowId}/runs`),
    ]);
    const wfData = await wfRes.json();
    const runsData = await runsRes.json();
    if (wfRes.ok) setWorkflow(wfData.workflow);
    if (runsRes.ok) setRuns(runsData.runs ?? []);
  }, [workflowId]);

  useEffect(() => {
    load().catch((e) => setError(e instanceof Error ? e.message : "Load failed"));
  }, [load]);

  async function save(partial?: Partial<Workflow>) {
    if (!workflow) return;
    setSaving(true);
    const res = await fetch(`/api/workflows/${workflowId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(partial ?? { definition: workflow.definition, name: workflow.name }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Save failed");
      return;
    }
    await load();
  }

  async function publish() {
    const res = await fetch(`/api/workflows/${workflowId}/publish`, { method: "POST", body: "{}" });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Publish failed");
      return;
    }
    await load();
  }

  async function runNow() {
    const res = await fetch(`/api/workflows/${workflowId}/runs`, { method: "POST", body: "{}" });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Run failed");
      return;
    }
    await load();
  }

  function addAction(kind: string) {
    if (!workflow) return;
    const id = `action-${Date.now()}`;
    const nodes = [...workflow.definition.nodes];
    const last = nodes[nodes.length - 1];
    nodes.push({
      id,
      type: "action",
      kind,
      label: kind,
      config: kind === "run_agent" ? { task: "{{brief}}", agentKey: "content" } : {},
    });
    const edges = [...(workflow.definition.edges as Array<{ id: string; source: string; target: string }>)];
    if (last) {
      edges.push({ id: `e-${id}`, source: last.id, target: id });
    }
    setWorkflow({ ...workflow, definition: { ...workflow.definition, nodes, edges } });
  }

  if (!workflow) return <main style={{ padding: "2rem" }}>Loading…</main>;

  return (
    <main style={{ padding: "2rem", maxWidth: 1100, margin: "0 auto" }}>
      <Link href="/workflows">← Workflows</Link>
      <header style={{ margin: "1rem 0", display: "flex", justifyContent: "space-between", gap: "1rem" }}>
        <div>
          <input
            value={workflow.name}
            onChange={(e) => setWorkflow({ ...workflow, name: e.target.value })}
            style={{ fontSize: "1.25rem", fontWeight: 600, background: "transparent", border: "none", color: "inherit" }}
          />
          <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
            {workflow.triggerType} · {workflow.status} · v{workflow.version}
          </p>
          {workflow.webhookSecret && (
            <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
              Webhook: POST /api/workflows/webhooks/{workflow.id} · Header x-workflow-secret
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button type="button" disabled={saving} onClick={() => void save()}>Save</button>
          <button type="button" onClick={() => void publish()}>Publish</button>
          <button type="button" onClick={() => void runNow()}>Run now</button>
        </div>
      </header>

      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}

      <section
        style={{
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "1rem",
          marginBottom: "1.5rem",
          background: "var(--surface)",
        }}
      >
        <h2 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>Workflow graph</h2>
        <ol style={{ paddingLeft: "1.25rem" }}>
          {workflow.definition.nodes.map((node) => (
            <li key={node.id} style={{ marginBottom: "0.5rem" }}>
              <strong>{node.label ?? node.kind}</strong>{" "}
              <span style={{ color: "var(--muted)", fontSize: "0.8rem" }}>
                ({node.type}/{node.kind})
              </span>
            </li>
          ))}
        </ol>
        <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {ACTION_TYPES.map((kind) => (
            <button key={kind} type="button" onClick={() => addAction(kind)}>
              + {kind}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>Recent runs</h2>
        {runs.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No runs yet.</p>
        ) : (
          <ul style={{ listStyle: "none", display: "grid", gap: "0.5rem" }}>
            {runs.map((run) => (
              <li key={run.id}>
                <Link href={`/workflows/${workflowId}/runs/${run.id}`}>
                  {run.status} · {new Date(run.startedAt).toLocaleString()}
                  {run.durationMs != null ? ` · ${run.durationMs}ms` : ""}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
