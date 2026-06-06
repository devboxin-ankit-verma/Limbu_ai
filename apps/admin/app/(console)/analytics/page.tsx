import { AdminAnalyticsClient } from "@/app/(console)/components/admin-analytics-client";

export const dynamic = "force-dynamic";

export default function AdminAnalyticsPage() {
  return (
    <div>
      <h1 style={{ marginBottom: "0.5rem" }}>Platform analytics</h1>
      <p style={{ color: "var(--muted)", marginBottom: "2rem" }}>
        Cross-tenant product, AI, business, and observability metrics.
      </p>
      <AdminAnalyticsClient />
    </div>
  );
}
