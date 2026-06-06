import Link from "next/link";
import { BillingClient } from "./billing-client";
import { requireAuth } from "@/lib/session";
import { hasPermission } from "@limbu/auth/rbac";

export const dynamic = "force-dynamic";

export default async function BillingPage({ params }: { params: Promise<{ orgId: string }> }) {
  const session = await requireAuth();
  const { orgId } = await params;

  const canManage = hasPermission("org:billing:manage", {
    isSuperAdmin: session.user.isSuperAdmin,
    orgRole: session.user.orgRole,
    workspaceRole: session.user.workspaceRole,
  });

  return (
    <main style={{ padding: "2rem", maxWidth: 960, margin: "0 auto" }}>
      <header style={{ marginBottom: "2rem" }}>
        <h1 style={{ marginBottom: "0.5rem" }}>Billing & Subscription</h1>
        <p style={{ color: "var(--muted)" }}>
          Manage your plan, usage, invoices, and payment methods.
        </p>
      </header>
      <BillingClient organizationId={orgId} canManage={canManage} />
    </main>
  );
}
