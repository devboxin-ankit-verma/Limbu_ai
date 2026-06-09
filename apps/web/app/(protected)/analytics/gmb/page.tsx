import Link from "next/link";
import { requireAuth } from "@/lib/session";
import { PageHeader } from "@limbu/ui/components/page-header";

export default async function GmbAnalyticsPage() {
  const session = await requireAuth();
  const orgId = session.user.organizationId;

  return (
    <div>
      <PageHeader
        title="GMB Analytics"
        description="Track profile visibility, engagement, and post performance."
      />

      {orgId ? (
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "1.5rem",
          }}
        >
          <p style={{ color: "var(--muted)", marginBottom: "1rem" }}>
            View detailed org analytics including AI usage and product metrics.
          </p>
          <Link
            href={`/organizations/${orgId}/analytics`}
            style={{
              padding: "0.5rem 1rem",
              background: "var(--primary)",
              color: "#fff",
              borderRadius: 8,
              textDecoration: "none",
              fontSize: "0.875rem",
            }}
          >
            Open Full Analytics
          </Link>
        </div>
      ) : (
        <p style={{ color: "var(--muted)" }}>Create an organization to view analytics.</p>
      )}
    </div>
  );
}
