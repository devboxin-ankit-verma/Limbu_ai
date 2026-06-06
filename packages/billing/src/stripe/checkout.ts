import {
  BillingInterval,
  CreditTransactionType,
  PlanTier,
  prisma,
  SubscriptionStatus,
} from "@limbu/db";
import { writeBillingAuditLog } from "../audit";
import { BILLING_CONFIG, getStripePriceId } from "../config";
import { BillingError, BillingNotFoundError } from "../errors";
import { getStripeClient } from "./client";
import type Stripe from "stripe";

export async function getOrCreateStripeCustomer(input: {
  organizationId: string;
  email: string;
  name?: string | null;
}): Promise<string> {
  const org = await prisma.organization.findUnique({
    where: { id: input.organizationId },
    select: { stripeCustomerId: true, name: true },
  });
  if (!org) throw new BillingNotFoundError("Organization not found");

  if (org.stripeCustomerId) return org.stripeCustomerId;

  if (BILLING_CONFIG.mockStripe) {
    const mockId = `cus_mock_${input.organizationId.slice(0, 8)}`;
    await prisma.organization.update({
      where: { id: input.organizationId },
      data: { stripeCustomerId: mockId },
    });
    return mockId;
  }

  const stripe = getStripeClient();
  const customer = await stripe.customers.create({
    email: input.email,
    name: input.name ?? org.name,
    metadata: { organizationId: input.organizationId },
  });

  await prisma.organization.update({
    where: { id: input.organizationId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

export async function createCheckoutSession(input: {
  organizationId: string;
  userId: string;
  email: string;
  plan: PlanTier;
  interval: BillingInterval;
  couponCode?: string;
}): Promise<{ url: string; sessionId: string }> {
  if (input.plan === PlanTier.free) {
    throw new BillingError("Free plan does not require checkout", "INVALID_PLAN");
  }

  const priceId = getStripePriceId(input.plan, input.interval);
  if (!priceId && !BILLING_CONFIG.mockStripe) {
    throw new BillingError(
      `Stripe price not configured for ${input.plan} (${input.interval})`,
      "PRICE_NOT_CONFIGURED",
    );
  }

  const customerId = await getOrCreateStripeCustomer({
    organizationId: input.organizationId,
    email: input.email,
  });

  const successUrl = `${BILLING_CONFIG.appUrl}/organizations/${input.organizationId}/billing?checkout=success`;
  const cancelUrl = `${BILLING_CONFIG.appUrl}/organizations/${input.organizationId}/billing?checkout=cancelled`;

  if (BILLING_CONFIG.mockStripe) {
    await syncMockSubscription({
      organizationId: input.organizationId,
      plan: input.plan,
      interval: input.interval,
      customerId,
    });
    await writeBillingAuditLog({
      organizationId: input.organizationId,
      actorId: input.userId,
      action: "billing.checkout.completed",
      resourceType: "subscription",
      metadata: { plan: input.plan, interval: input.interval, mock: true },
    });
    return { url: successUrl, sessionId: `cs_mock_${Date.now()}` };
  }

  const stripe = getStripeClient();
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId!, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    subscription_data: {
      trial_period_days: BILLING_CONFIG.defaultTrialDays,
      metadata: {
        organizationId: input.organizationId,
        planTier: input.plan,
        billingInterval: input.interval,
      },
    },
    metadata: {
      organizationId: input.organizationId,
      planTier: input.plan,
      billingInterval: input.interval,
    },
    allow_promotion_codes: true,
  };

  if (input.couponCode) {
    sessionParams.discounts = [{ coupon: input.couponCode }];
  }

  const session = await stripe.checkout.sessions.create(sessionParams);

  await writeBillingAuditLog({
    organizationId: input.organizationId,
    actorId: input.userId,
    action: "billing.checkout.started",
    resourceType: "checkout_session",
    resourceId: session.id,
    metadata: { plan: input.plan, interval: input.interval },
  });

  if (!session.url) {
    throw new BillingError("Failed to create checkout session", "CHECKOUT_FAILED", 500);
  }

  return { url: session.url, sessionId: session.id };
}

async function syncMockSubscription(input: {
  organizationId: string;
  plan: PlanTier;
  interval: BillingInterval;
  customerId: string;
}) {
  const now = new Date();
  const periodEnd = new Date(now);
  if (input.interval === BillingInterval.annual) {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  } else {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  }

  await prisma.$transaction(async (tx) => {
    await tx.subscription.updateMany({
      where: { organizationId: input.organizationId, isCurrent: true },
      data: { isCurrent: false },
    });

    await tx.subscription.create({
      data: {
        organizationId: input.organizationId,
        stripeSubscriptionId: `sub_mock_${input.organizationId.slice(0, 8)}_${Date.now()}`,
        plan: input.plan,
        billingInterval: input.interval,
        status: SubscriptionStatus.active,
        isCurrent: true,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    });

    await tx.organization.update({
      where: { id: input.organizationId },
      data: { planTier: input.plan },
    });
  });

  const { grantMonthlyCredits } = await import("../services/credit.service");
  await grantMonthlyCredits(input.organizationId, input.plan);
}

export { syncMockSubscription };
