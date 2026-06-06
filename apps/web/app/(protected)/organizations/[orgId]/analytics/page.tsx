import { AnalyticsClient } from "./analytics-client";
import { requireOrgPermission } from "@/lib/rbac/guards";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  await requireOrgPermission(orgId, "org:analytics:read");

  return (
    <main style={{ padding: "2rem", maxWidth: 960, margin: "0 auto" }}>
      <header style={{ marginBottom: "2rem" }}>
        <h1 style={{ marginBottom: "0.5rem" }}>Analytics</h1>
        <p style={{ color: "var(--muted)" }}>
          Product usage, AI costs, business metrics, and system observability.
        </p>
      </header>
      <AnalyticsClient organizationId={orgId} />
    </main>
  );
}
