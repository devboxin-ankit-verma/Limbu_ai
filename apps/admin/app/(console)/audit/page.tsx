"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { tableStyle, tdStyle, thStyle } from "@limbu/ui/layout/admin/admin-shell";

type Log = {
  id: string;
  organizationName: string;
  actorEmail: string | null;
  action: string;
  resourceType: string;
  createdAt: string;
};

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [actionFilter, setActionFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const q = actionFilter ? `?action=${encodeURIComponent(actionFilter)}` : "";
    const res = await adminApi(`/audit-logs${q}`);
    const data = await res.json();
    setLogs(data.items ?? []);
    setLoading(false);
  }, [actionFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      <h1 style={{ marginBottom: "1rem" }}>Audit Logs</h1>
      <input
        type="search"
        placeholder="Filter by action…"
        value={actionFilter}
        onChange={(e) => setActionFilter(e.target.value)}
        style={{
          padding: "0.5rem 0.75rem",
          border: "1px solid var(--border)",
          borderRadius: 8,
          marginBottom: "1rem",
          width: "100%",
          maxWidth: 320,
          background: "var(--bg)",
          color: "var(--text)",
        }}
      />
      {loading ? (
        <p style={{ color: "var(--muted)" }}>Loading…</p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Time</th>
              <th style={thStyle}>Organization</th>
              <th style={thStyle}>Actor</th>
              <th style={thStyle}>Action</th>
              <th style={thStyle}>Resource</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id}>
                <td style={tdStyle}>{new Date(l.createdAt).toLocaleString()}</td>
                <td style={tdStyle}>{l.organizationName}</td>
                <td style={tdStyle}>{l.actorEmail ?? "—"}</td>
                <td style={tdStyle}>{l.action}</td>
                <td style={tdStyle}>{l.resourceType}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
