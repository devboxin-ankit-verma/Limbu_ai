"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PageHeader } from "@limbu/ui/components/page-header";
import { connectGoogle, fetchIntegrations, syncIntegration, type IntegrationItem } from "@/lib/gmb/client";

export function IntegrationsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [connections, setConnections] = useState<IntegrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  function load() {
    fetchIntegrations()
      .then((r) => setConnections(r.connections))
      .catch(() => setConnections([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    if (searchParams.get("connected")) {
      router.replace("/integrations");
    }
  }, [searchParams, router]);

  async function handleConnect() {
    setBusy(true);
    try {
      const result = await connectGoogle();
      if (result.mock) {
        router.push("/integrations?connected=mock");
        load();
      } else if (result.url) {
        window.location.href = result.url;
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleSync(connectionId: string) {
    setBusy(true);
    try {
      await syncIntegration(connectionId);
      load();
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p style={{ color: "var(--muted)" }}>Loading integrations…</p>;

  return (
    <div>
      <PageHeader
        title="Integrations"
        description="Connect Google Business Profile and social accounts."
      />

      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "1.5rem",
          marginBottom: "1.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "2rem" }}>G</span>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontWeight: 600 }}>Google Business Profile</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
              Auto-publish posts, sync reviews, and manage locations.
            </p>
          </div>
          <button
            type="button"
            onClick={handleConnect}
            disabled={busy}
            style={{
              padding: "0.5rem 1rem",
              background: "var(--primary)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            {connections.length > 0 ? "Reconnect" : "Connect Google"}
          </button>
        </div>
      </div>

      {connections.map((conn) => (
        <div
          key={conn.id}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "1rem",
            marginBottom: "0.75rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontWeight: 600 }}>{conn.provider}</p>
              <p style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                Status: {conn.status} · {conn.locations.length} location(s)
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleSync(conn.id)}
              disabled={busy}
              style={{
                padding: "0.375rem 0.75rem",
                border: "1px solid var(--border)",
                borderRadius: 6,
                background: "transparent",
                color: "var(--text)",
                cursor: "pointer",
                fontSize: "0.8rem",
              }}
            >
              Sync Reviews
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
