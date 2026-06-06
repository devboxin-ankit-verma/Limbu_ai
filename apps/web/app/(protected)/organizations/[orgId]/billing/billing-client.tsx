"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";

type Plan = {
  tier: string;
  name: string;
  description: string;
  monthlyPriceUsd: number | null;
  annualPriceUsd: number | null;
  trialDays: number;
  popular?: boolean;
  contactSales?: boolean;
};

type BillingOverview = {
  organization: { planTier: string; stripeCustomerId: string | null; name: string } | null;
  subscription: {
    plan: string;
    billingInterval: string;
    status: string;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  };
  usage: {
    periodStart: string;
    periodEnd: string;
    metrics: Record<string, { quantity: number; limit: number | null; unit: string }>;
    credits: {
      balance: number;
      monthlyAllowance: number;
      usedThisPeriod: number;
    };
  };
  credits: {
    balance: number;
    monthlyAllowance: number;
    usedThisPeriod: number;
  };
  invoices: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    pdfUrl: string | null;
    createdAt: string;
  }>;
};

export function BillingClient({
  organizationId,
  canManage,
}: {
  organizationId: string;
  canManage: boolean;
}) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [overview, setOverview] = useState<BillingOverview | null>(null);
  const [interval, setInterval] = useState<"monthly" | "annual">("monthly");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [plansRes, billingRes] = await Promise.all([
        fetch("/api/billing/plans"),
        fetch(`/api/organizations/${organizationId}/billing`),
      ]);
      const plansData = await plansRes.json();
      const billingData = await billingRes.json();
      setPlans(plansData.plans ?? []);
      setOverview(billingData);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function checkout(plan: string) {
    if (!canManage) return;
    setActionLoading(plan);
    setMessage(null);
    try {
      const res = await fetch(`/api/organizations/${organizationId}/billing/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, interval }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      window.location.href = data.url;
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setActionLoading(null);
    }
  }

  async function openPortal() {
    if (!canManage) return;
    setActionLoading("portal");
    try {
      const res = await fetch(`/api/organizations/${organizationId}/billing/portal`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Portal failed");
      window.location.href = data.url;
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Portal failed");
    } finally {
      setActionLoading(null);
    }
  }

  async function cancelSubscription() {
    if (!canManage || !confirm("Cancel subscription at end of billing period?")) return;
    setActionLoading("cancel");
    try {
      const res = await fetch(`/api/organizations/${organizationId}/billing/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancelAtPeriodEnd: true }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Cancel failed");
      }
      setMessage("Subscription will cancel at period end.");
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Cancel failed");
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return <p style={{ color: "var(--muted)" }}>Loading billing…</p>;
  }

  const currentPlan = overview?.subscription?.plan ?? "free";

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      {message && (
        <p
          style={{
            padding: "0.75rem 1rem",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 8,
          }}
        >
          {message}
        </p>
      )}

      <section
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "1.5rem",
        }}
      >
        <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Current plan</h2>
        <dl style={{ display: "grid", gap: "0.5rem", fontSize: "0.9rem" }}>
          <div>
            <dt style={{ color: "var(--muted)" }}>Plan</dt>
            <dd style={{ textTransform: "capitalize" }}>{currentPlan}</dd>
          </div>
          <div>
            <dt style={{ color: "var(--muted)" }}>Status</dt>
            <dd style={{ textTransform: "capitalize" }}>{overview?.subscription?.status}</dd>
          </div>
          <div>
            <dt style={{ color: "var(--muted)" }}>Billing interval</dt>
            <dd style={{ textTransform: "capitalize" }}>
              {overview?.subscription?.billingInterval ?? "—"}
            </dd>
          </div>
          {overview?.subscription?.currentPeriodEnd && (
            <div>
              <dt style={{ color: "var(--muted)" }}>Period ends</dt>
              <dd>{new Date(overview.subscription.currentPeriodEnd).toLocaleDateString()}</dd>
            </div>
          )}
          <div>
            <dt style={{ color: "var(--muted)" }}>AI credits</dt>
            <dd>
              {overview?.credits?.balance ?? 0} / {overview?.credits?.monthlyAllowance ?? 0}{" "}
              remaining
            </dd>
          </div>
        </dl>
        {canManage && overview?.organization?.stripeCustomerId && (
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => void openPortal()}
              disabled={actionLoading === "portal"}
              style={btnStyle}
            >
              Manage payment methods
            </button>
            {overview?.subscription?.status !== "cancelled" &&
              currentPlan !== "free" &&
              !overview?.subscription?.cancelAtPeriodEnd && (
                <button
                  type="button"
                  onClick={() => void cancelSubscription()}
                  disabled={actionLoading === "cancel"}
                  style={{ ...btnStyle, color: "var(--danger)" }}
                >
                  Cancel subscription
                </button>
              )}
          </div>
        )}
      </section>

      <section
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "1.5rem",
        }}
      >
        <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Usage this period</h2>
        <div style={{ display: "grid", gap: "0.5rem", fontSize: "0.875rem" }}>
          {overview?.usage?.metrics &&
            Object.entries(overview.usage.metrics).map(([key, metric]) => (
              <div
                key={key}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0.5rem 0",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <span style={{ color: "var(--muted)" }}>{formatMetricLabel(key)}</span>
                <span>
                  {formatMetricValue(key, metric.quantity)}
                  {metric.limit !== null ? ` / ${formatMetricValue(key, metric.limit)}` : ""}
                </span>
              </div>
            ))}
        </div>
      </section>

      {overview?.invoices && overview.invoices.length > 0 && (
        <section
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "1.5rem",
          }}
        >
          <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Invoices</h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {overview.invoices.map((inv) => (
              <li
                key={inv.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0.5rem 0",
                  borderBottom: "1px solid var(--border)",
                  fontSize: "0.875rem",
                }}
              >
                <span>
                  ${(inv.amount / 100).toFixed(2)} {inv.currency.toUpperCase()} — {inv.status}
                </span>
                {inv.pdfUrl && (
                  <a href={inv.pdfUrl} target="_blank" rel="noreferrer">
                    PDF
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {canManage && (
        <section>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <h2 style={{ fontSize: "1.125rem" }}>Plans</h2>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                type="button"
                onClick={() => setInterval("monthly")}
                style={{
                  ...btnStyle,
                  background: interval === "monthly" ? "var(--text)" : "transparent",
                  color: interval === "monthly" ? "var(--bg)" : "var(--text)",
                }}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setInterval("annual")}
                style={{
                  ...btnStyle,
                  background: interval === "annual" ? "var(--text)" : "transparent",
                  color: interval === "annual" ? "var(--bg)" : "var(--text)",
                }}
              >
                Annual
              </button>
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "1rem",
            }}
          >
            {plans
              .filter((p) => p.tier !== "free")
              .map((plan) => {
                const price =
                  interval === "annual" ? plan.annualPriceUsd : plan.monthlyPriceUsd;
                const isCurrent = plan.tier === currentPlan;
                return (
                  <div
                    key={plan.tier}
                    style={{
                      background: "var(--surface)",
                      border: plan.popular
                        ? "2px solid var(--text)"
                        : "1px solid var(--border)",
                      borderRadius: 12,
                      padding: "1.25rem",
                    }}
                  >
                    {plan.popular && (
                      <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Popular</span>
                    )}
                    <h3 style={{ margin: "0.25rem 0" }}>{plan.name}</h3>
                    <p style={{ fontSize: "0.8rem", color: "var(--muted)", minHeight: 40 }}>
                      {plan.description}
                    </p>
                    <p style={{ fontSize: "1.25rem", fontWeight: 600, margin: "0.75rem 0" }}>
                      {plan.contactSales
                        ? "Contact sales"
                        : price === 0
                          ? "Free"
                          : `$${price}/${interval === "annual" ? "yr" : "mo"}`}
                    </p>
                    {plan.trialDays > 0 && (
                      <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                        {plan.trialDays}-day trial
                      </p>
                    )}
                    {canManage && !plan.contactSales && !isCurrent && (
                      <button
                        type="button"
                        onClick={() => void checkout(plan.tier)}
                        disabled={actionLoading === plan.tier}
                        style={{ ...btnStyle, width: "100%", marginTop: "0.75rem" }}
                      >
                        {actionLoading === plan.tier ? "Redirecting…" : "Upgrade"}
                      </button>
                    )}
                    {isCurrent && (
                      <p style={{ fontSize: "0.8rem", marginTop: "0.75rem" }}>Current plan</p>
                    )}
                  </div>
                );
              })}
          </div>
        </section>
      )}

      <Link href={`/organizations/${organizationId}/settings`} style={{ fontSize: "0.875rem" }}>
        ← Back to settings
      </Link>
    </div>
  );
}

const btnStyle: CSSProperties = {
  padding: "0.5rem 1rem",
  border: "1px solid var(--border)",
  borderRadius: 8,
  background: "transparent",
  color: "var(--text)",
  cursor: "pointer",
  fontSize: "0.875rem",
};

function formatMetricLabel(key: string): string {
  return key.replace(/_/g, " ");
}

function formatMetricValue(key: string, value: number): string {
  if (key === "storage_bytes") {
    if (value >= 1024 * 1024 * 1024) return `${(value / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    if (value >= 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)} MB`;
    if (value >= 1024) return `${(value / 1024).toFixed(1)} KB`;
    return `${value} B`;
  }
  return value.toLocaleString();
}
