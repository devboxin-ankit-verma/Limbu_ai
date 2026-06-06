import Stripe from "stripe";
import { BillingInterval, PlanTier } from "@limbu/db";
import { BILLING_CONFIG, getStripePriceId } from "../config";

let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (BILLING_CONFIG.mockStripe) {
    throw new Error("Stripe client unavailable in mock mode");
  }
  if (!BILLING_CONFIG.stripeSecretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  if (!stripeClient) {
    stripeClient = new Stripe(BILLING_CONFIG.stripeSecretKey, {
      apiVersion: "2025-02-24.acacia",
      typescript: true,
    });
  }
  return stripeClient;
}

export function mapStripeSubscriptionStatus(
  status: Stripe.Subscription.Status,
): "trialing" | "active" | "past_due" | "cancelled" | "unpaid" {
  switch (status) {
    case "trialing":
      return "trialing";
    case "active":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
    case "incomplete_expired":
      return "cancelled";
    default:
      return "unpaid";
  }
}

export function planTierFromStripePrice(priceId: string): {
  tier: PlanTier;
  interval: BillingInterval;
} | null {
  for (const tier of [
    PlanTier.starter,
    PlanTier.pro,
    PlanTier.team,
    PlanTier.enterprise,
  ]) {
    for (const interval of [BillingInterval.monthly, BillingInterval.annual]) {
      const id = getStripePriceId(tier, interval);
      if (id === priceId) return { tier, interval };
    }
  }
  return null;
}
