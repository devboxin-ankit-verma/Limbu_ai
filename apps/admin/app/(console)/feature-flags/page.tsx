"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { btnStyle, tableStyle, tdStyle, thStyle } from "@limbu/ui/layout/admin/admin-shell";

type Flag = {
  key: string;
  defaultValue: boolean;
  description: string | null;
  overrideCount: number;
};

export default function AdminFeatureFlagsPage() {
  const [flags, setFlags] = useState<Flag[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await adminApi("/feature-flags");
    const data = await res.json();
    setFlags(data.flags ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggleDefault(flag: Flag) {
    await adminApi("/feature-flags", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: flag.key, defaultValue: !flag.defaultValue }),
    });
    await load();
  }

  return (
    <div>
      <h1 style={{ marginBottom: "1rem" }}>Feature Flags</h1>
      {loading ? (
        <p style={{ color: "var(--muted)" }}>Loading…</p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Key</th>
              <th style={thStyle}>Default</th>
              <th style={thStyle}>Overrides</th>
              <th style={thStyle}>Description</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {flags.map((f) => (
              <tr key={f.key}>
                <td style={tdStyle}>
                  <code>{f.key}</code>
                </td>
                <td style={tdStyle}>{f.defaultValue ? "On" : "Off"}</td>
                <td style={tdStyle}>{f.overrideCount}</td>
                <td style={tdStyle}>{f.description ?? "—"}</td>
                <td style={tdStyle}>
                  <button type="button" style={btnStyle} onClick={() => void toggleDefault(f)}>
                    Toggle default
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
