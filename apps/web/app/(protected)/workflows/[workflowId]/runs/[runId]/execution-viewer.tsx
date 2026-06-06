"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type StepLog = {
  id: string;
  nodeId: string;
  nodeType: string;
  nodeKind: string;
  status: string;
  error: string | null;
  durationMs: number | null;
  startedAt: string;
};

export function ExecutionViewerClient({
  workflowId,
  runId,
}: {
  workflowId: string;
  runId: string;
}) {
  const [run, setRun] = useState<Record<string, unknown> | null>(null);
  const [stepLogs, setStepLogs] = useState<StepLog[]>([]);

  useEffect(() => {
    fetch(`/api/workflows/runs/${runId}`)
      .then((r) => r.json())
      .then((data) => {
        setRun(data.run);
        setStepLogs(data.stepLogs ?? []);
      })
      .catch(() => undefined);
  }, [runId]);

  if (!run) return <main style={{ padding: "2rem" }}>Loading execution…</main>;

  return (
    <main style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      <Link href={`/workflows/${workflowId}`}>← Back to builder</Link>
      <h1 style={{ margin: "1rem 0 0.5rem" }}>Execution {runId.slice(0, 8)}…</h1>
      <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
        Status: {String(run.status)} · Duration: {String(run.durationMs ?? "—")}ms
      </p>
      {run.error != null && (
        <p style={{ color: "var(--danger)", marginBottom: "1rem" }}>{String(run.error)}</p>
      )}

      <section>
        <h2 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>Step logs</h2>
        <ul style={{ listStyle: "none", display: "grid", gap: "0.75rem" }}>
          {stepLogs.map((log) => (
            <li
              key={log.id}
              style={{
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "0.75rem 1rem",
                fontSize: "0.875rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>
                  {log.nodeKind} ({log.nodeType})
                </strong>
                <span>{log.status}</span>
              </div>
              <div style={{ color: "var(--muted)", fontSize: "0.8rem" }}>
                {log.nodeId}
                {log.durationMs != null ? ` · ${log.durationMs}ms` : ""}
              </div>
              {log.error && <p style={{ color: "var(--danger)", marginTop: "0.25rem" }}>{log.error}</p>}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
