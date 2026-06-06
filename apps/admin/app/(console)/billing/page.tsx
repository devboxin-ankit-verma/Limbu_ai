import { AdminBillingClient } from "@/app/(console)/components/admin-billing-client";

export const dynamic = "force-dynamic";

export default function AdminBillingPage() {
  return (
    <div>
      <h1 style={{ marginBottom: "0.5rem" }}>Billing administration</h1>
      <p style={{ color: "var(--muted)", marginBottom: "2rem" }}>
        Manage plan entitlements and feature gating defaults.
      </p>
      <AdminBillingClient />
    </div>
  );
}
