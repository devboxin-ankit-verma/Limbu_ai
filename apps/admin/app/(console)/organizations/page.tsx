"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { btnStyle, tableStyle, tdStyle, thStyle } from "@limbu/ui/layout/admin/admin-shell";

type Org = {
  id: string;
  name: string;
  slug: string;
  planTier: string;
  status: string;
  memberCount: number;
  ownerEmail: string | null;
};

export default function AdminOrganizationsPage() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await adminApi("/organizations");
    const data = await res.json();
    setOrgs(data.items ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function suspendOrg(org: Org) {
    if (!confirm(`Suspend ${org.name}?`)) return;
    await adminApi(`/organizations/${org.id}`, { method: "DELETE" });
    await load();
  }

  async function activateOrg(org: Org) {
    await adminApi(`/organizations/${org.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "active" }),
    });
    await load();
  }

  return (
    <div>
      <h1 style={{ marginBottom: "1rem" }}>Organization Management</h1>
      {loading ? (
        <p style={{ color: "var(--muted)" }}>Loading…</p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Plan</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Members</th>
              <th style={thStyle}>Owner</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orgs.map((o) => (
              <tr key={o.id}>
                <td style={tdStyle}>{o.name}</td>
                <td style={tdStyle}>{o.planTier}</td>
                <td style={tdStyle}>{o.status}</td>
                <td style={tdStyle}>{o.memberCount}</td>
                <td style={tdStyle}>{o.ownerEmail ?? "—"}</td>
                <td style={tdStyle}>
                  {o.status === "active" ? (
                    <button type="button" style={btnStyle} onClick={() => void suspendOrg(o)}>
                      Suspend
                    </button>
                  ) : (
                    <button type="button" style={btnStyle} onClick={() => void activateOrg(o)}>
                      Activate
                    </button>
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
