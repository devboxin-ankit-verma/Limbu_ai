"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { tableStyle, tdStyle, thStyle } from "@limbu/ui/layout/admin/admin-shell";

type Workspace = {
  id: string;
  name: string;
  organizationId: string;
  organizationName: string;
  status: string;
  memberCount: number;
  createdAt: string;
};

export default function AdminWorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const q = search ? `?search=${encodeURIComponent(search)}` : "";
    const res = await adminApi(`/workspaces${q}`);
    const data = await res.json();
    setWorkspaces(data.items ?? []);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      <h1 style={{ marginBottom: "1rem" }}>Workspace Management</h1>
      <input
        type="search"
        placeholder="Search workspace or organization…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
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
              <th style={thStyle}>Workspace</th>
              <th style={thStyle}>Organization</th>
              <th style={thStyle}>Members</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Created</th>
            </tr>
          </thead>
          <tbody>
            {workspaces.map((w) => (
              <tr key={w.id}>
                <td style={tdStyle}>{w.name}</td>
                <td style={tdStyle}>{w.organizationName}</td>
                <td style={tdStyle}>{w.memberCount}</td>
                <td style={tdStyle}>{w.status}</td>
                <td style={tdStyle}>{new Date(w.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
