"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@limbu/ui/components/page-header";
import { EmptyState } from "@limbu/ui/components/empty-state";
import { generateMagicQr } from "@/lib/gmb/client";

type Location = { id: string; name: string | null };

export function MagicQrClient() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [funnelUrl, setFunnelUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/locations")
      .then((r) => r.json())
      .then((d) => {
        const locs = (d.locations ?? []) as Location[];
        setLocations(locs);
        if (locs[0]) setSelectedId(locs[0].id);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleGenerate() {
    if (!selectedId) return;
    setBusy(true);
    try {
      const result = await generateMagicQr(selectedId);
      setQrDataUrl(result.qrDataUrl);
      setFunnelUrl(result.funnelUrl);
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p style={{ color: "var(--muted)" }}>Loading…</p>;

  if (locations.length === 0) {
    return (
      <div>
        <PageHeader title="Magic QR" description="Filter negative reviews with smart QR technology." />
        <EmptyState
          icon="📱"
          title="Connect a location first"
          description="Magic QR requires at least one connected Google Business location."
          actionLabel="Connect Google"
          actionHref="/integrations"
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Magic QR"
        description="Generate review funnel QR codes for each location."
      />

      <div
        style={{
          maxWidth: 480,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "1.5rem",
        }}
      >
        <label style={{ display: "flex", flexDirection: "column", gap: "0.375rem", marginBottom: "1rem" }}>
          <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>Location</span>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            style={{
              padding: "0.625rem",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--bg)",
              color: "var(--text)",
            }}
          >
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name ?? l.id}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={busy}
          style={{
            padding: "0.625rem 1rem",
            background: "var(--primary)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 500,
            marginBottom: "1rem",
          }}
        >
          Generate QR Code
        </button>

        {qrDataUrl && (
          <div style={{ textAlign: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt="Magic QR Code" width={300} height={300} style={{ borderRadius: 8 }} />
            {funnelUrl && (
              <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.75rem", wordBreak: "break-all" }}>
                {funnelUrl}
              </p>
            )}
            <a
              href={qrDataUrl}
              download="limbu-magic-qr.png"
              style={{
                display: "inline-block",
                marginTop: "0.75rem",
                fontSize: "0.875rem",
              }}
            >
              Download PNG
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
