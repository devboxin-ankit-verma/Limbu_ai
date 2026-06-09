"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@limbu/ui/components/page-header";
import { EmptyState } from "@limbu/ui/components/empty-state";

type Location = {
  id: string;
  name: string | null;
  address: string | null;
  provider: string;
  connectionStatus: string;
};

export function LocationsClient() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/locations")
      .then((r) => r.json())
      .then((d) => setLocations(d.locations ?? []))
      .catch(() => setLocations([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: "var(--muted)" }}>Loading locations…</p>;

  return (
    <div>
      <PageHeader
        title="Locations"
        description="Manage connected Google Business Profile locations."
        actionLabel="Connect Google"
        actionHref="/integrations"
      />

      {locations.length === 0 ? (
        <EmptyState
          icon="📍"
          title="No locations connected"
          description="Connect your Google Business Profile to manage locations."
          actionLabel="Connect Google"
          actionHref="/integrations"
        />
      ) : (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {locations.map((loc) => (
            <div
              key={loc.id}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "1rem",
              }}
            >
              <h3 style={{ fontWeight: 600, marginBottom: "0.25rem" }}>{loc.name ?? "Unnamed"}</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>{loc.address}</p>
              <span style={{ fontSize: "0.75rem", color: "var(--success)" }}>{loc.connectionStatus}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
