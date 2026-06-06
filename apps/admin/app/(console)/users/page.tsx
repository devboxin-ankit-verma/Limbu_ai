"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { btnStyle, tableStyle, tdStyle, thStyle } from "@limbu/ui/layout/admin/admin-shell";

type User = {
  id: string;
  email: string;
  name: string | null;
  isSuperAdmin: boolean;
  organizationCount: number;
  deletedAt: string | null;
  createdAt: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const q = search ? `?search=${encodeURIComponent(search)}` : "";
    const res = await adminApi(`/users${q}`);
    const data = await res.json();
    setUsers(data.items ?? []);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggleSuperAdmin(user: User) {
    await adminApi(`/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isSuperAdmin: !user.isSuperAdmin }),
    });
    await load();
  }

  async function suspendUser(user: User) {
    if (!confirm(`Suspend ${user.email}?`)) return;
    await adminApi(`/users/${user.id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <h1 style={{ marginBottom: "1rem" }}>User Management</h1>
      <input
        type="search"
        placeholder="Search email or name…"
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
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Orgs</th>
              <th style={thStyle}>Super admin</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={tdStyle}>{u.email}</td>
                <td style={tdStyle}>{u.organizationCount}</td>
                <td style={tdStyle}>{u.isSuperAdmin ? "Yes" : "No"}</td>
                <td style={tdStyle}>{u.deletedAt ? "Suspended" : "Active"}</td>
                <td style={tdStyle}>
                  {!u.deletedAt && (
                    <>
                      <button type="button" style={btnStyle} onClick={() => void toggleSuperAdmin(u)}>
                        {u.isSuperAdmin ? "Revoke admin" : "Make admin"}
                      </button>{" "}
                      {!u.isSuperAdmin && (
                        <button
                          type="button"
                          style={{ ...btnStyle, color: "var(--danger)" }}
                          onClick={() => void suspendUser(u)}
                        >
                          Suspend
                        </button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
