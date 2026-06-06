import type { PlanTier } from "@limbu/db";
import type { BillingInterval } from "@limbu/db";

function env(key: string, fallback = ""): string {
  return process.env[key]?.trim() ?? fallback;
}

export const BILLING_CONFIG = {
  stripeSecretKey: env("STRIPE_SECRET_KEY"),
  stripeWebhookSecret: env("STRIPE_WEBHOOK_SECRET"),
  appUrl: env("NEXTAUTH_URL", "http://localhost:3000"),
  defaultTrialDays: Number(env("BILLING_DEFAULT_TRIAL_DAYS", "14")),
  /** When true, Stripe operations are mocked (no API calls). */
  mockStripe: env("BILLING_MOCK_STRIPE", "false") === "true",
} as const;

/** Stripe Price IDs mapped by plan tier and billing interval. */
export function getStripePriceId(tier: PlanTier, interval: BillingInterval): string | null {
  if (tier === "free" || tier === "enterprise") return null;
  const key = `STRIPE_PRICE_${tier.toUpperCase()}_${interval.toUpperCase()}`;
  const value = env(key);
  return value || null;
}

export function requireStripeConfigured(): void {
  if (BILLING_CONFIG.mockStripe) return;
  if (!BILLING_CONFIG.stripeSecretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
}

export function requireWebhookSecretConfigured(): void {
  if (BILLING_CONFIG.mockStripe) return;
  if (!BILLING_CONFIG.stripeWebhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  }
}
