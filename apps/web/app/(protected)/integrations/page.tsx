import { Suspense } from "react";
import { IntegrationsClient } from "./integrations-client";

export default function IntegrationsPage() {
  return (
    <Suspense fallback={<p style={{ color: "var(--muted)" }}>Loading…</p>}>
      <IntegrationsClient />
    </Suspense>
  );
}
