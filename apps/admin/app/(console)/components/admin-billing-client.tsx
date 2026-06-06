"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { adminApi } from "@/lib/api";

type Entitlement = {
  planTier: string;
  maxWorkspaces: number;
  maxMembers: number;
  monthlyCredits: number;
  maxPostsPerMonth: number | null;
  features: Record<string, unknown>;
};

export function AdminBillingClient() {
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi("/billing/entitlements");
      const data = await res.json();
      setEntitlements(data.entitlements ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save(planTier: string, field: string, value: number) {
    setSaving(planTier);
    setMessage(null);
    try {
      const res = await adminApi(`/billing/entitlements/${planTier}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Save failed");
      }
      setMessage(`Updated ${planTier} ${field}`);
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(null);
    }
  }

  if (loading) return <p style={{ color: "var(--muted)" }}>Loading…</p>;

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      {message && <p style={{ color: "var(--muted)" }}>{message}</p>}

      <Link href="/" style={{ fontSize: "0.875rem" }}>
        ← Back to admin
      </Link>

      <section
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "1.5rem",
          overflowX: "auto",
        }}
      >
        <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Plan entitlements</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid var(--border)" }}>
              <th style={{ padding: "0.5rem" }}>Plan</th>
              <th style={{ padding: "0.5rem" }}>Workspaces</th>
              <th style={{ padding: "0.5rem" }}>Members</th>
              <th style={{ padding: "0.5rem" }}>Monthly credits</th>
            </tr>
          </thead>
          <tbody>
            {entitlements.map((e) => (
              <tr key={e.planTier} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "0.5rem", textTransform: "capitalize" }}>{e.planTier}</td>
                <td style={{ padding: "0.5rem" }}>
                  <EditableCell
                    value={e.maxWorkspaces}
                    onSave={(v) => void save(e.planTier, "maxWorkspaces", v)}
                    disabled={saving === e.planTier}
                  />
                </td>
                <td style={{ padding: "0.5rem" }}>
                  <EditableCell
                    value={e.maxMembers}
                    onSave={(v) => void save(e.planTier, "maxMembers", v)}
                    disabled={saving === e.planTier}
                  />
                </td>
                <td style={{ padding: "0.5rem" }}>
                  <EditableCell
                    value={e.monthlyCredits}
                    onSave={(v) => void save(e.planTier, "monthlyCredits", v)}
                    disabled={saving === e.planTier}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function EditableCell({
  value,
  onSave,
  disabled,
}: {
  value: number;
  onSave: (v: number) => void;
  disabled: boolean;
}) {
  const [edit, setEdit] = useState(false);
  const [draft, setDraft] = useState(String(value));

  if (!edit) {
    return (
      <button
        type="button"
        onClick={() => {
          setDraft(String(value));
          setEdit(true);
        }}
        style={{
          background: "none",
          border: "none",
          color: "var(--text)",
          cursor: "pointer",
          textDecoration: "underline",
          fontSize: "inherit",
        }}
      >
        {value}
      </button>
    );
  }

  return (
    <input
      type="number"
      value={draft}
      disabled={disabled}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        setEdit(false);
        const n = Number(draft);
        if (!Number.isNaN(n) && n !== value) onSave(n);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
      }}
      style={{
        width: 80,
        padding: "0.25rem",
        border: "1px solid var(--border)",
        borderRadius: 4,
        background: "var(--bg)",
        color: "var(--text)",
      }}
    />
  );
}
