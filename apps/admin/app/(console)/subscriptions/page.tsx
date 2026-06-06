"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { tableStyle, tdStyle, thStyle } from "@limbu/ui/layout/admin/admin-shell";

type Sub = {
  id: string;
  organizationId: string;
  organizationName: string;
  plan: string;
  billingInterval: string;
  status: string;
  cancelAtPeriodEnd: boolean;
};

const PLANS = ["free", "starter", "pro", "team", "enterprise"];

export default function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState<Sub[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await adminApi("/subscriptions");
    const data = await res.json();
    setSubs(data.items ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function changePlan(orgId: string, plan: string) {
    await adminApi(`/subscriptions/${orgId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    await load();
  }

  return (
    <div>
      <h1 style={{ marginBottom: "1rem" }}>Subscription Management</h1>
      {loading ? (
        <p style={{ color: "var(--muted)" }}>Loading…</p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Organization</th>
              <th style={thStyle}>Plan</th>
              <th style={thStyle}>Interval</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Change plan</th>
            </tr>
          </thead>
          <tbody>
            {subs.map((s) => (
              <tr key={s.id}>
                <td style={tdStyle}>{s.organizationName}</td>
                <td style={tdStyle}>{s.plan}</td>
                <td style={tdStyle}>{s.billingInterval}</td>
                <td style={tdStyle}>
                  {s.status}
                  {s.cancelAtPeriodEnd ? " (cancel pending)" : ""}
                </td>
                <td style={tdStyle}>
                  <select
                    defaultValue={s.plan}
                    onChange={(e) => void changePlan(s.organizationId, e.target.value)}
                    style={{
                      padding: "0.25rem",
                      borderRadius: 4,
                      border: "1px solid var(--border)",
                      background: "var(--bg)",
                      color: "var(--text)",
                      fontSize: "0.8rem",
                    }}
                  >
                    {PLANS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
