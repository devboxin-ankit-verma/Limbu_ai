import { BillingInterval, PlanTier, prisma, SubscriptionStatus } from "@limbu/db";
import type { SubscriptionSummary } from "../types";
import { BillingError } from "../errors";
import { BILLING_CONFIG, getStripePriceId } from "../config";
import { writeBillingAuditLog } from "../audit";
import { grantMonthlyCredits } from "./credit.service";
import { getStripeClient } from "../stripe/client";

export async function getSubscriptionSummary(
  organizationId: string,
): Promise<SubscriptionSummary> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { planTier: true },
  });

  const subscription = await prisma.subscription.findFirst({
    where: { organizationId, isCurrent: true },
    orderBy: { createdAt: "desc" },
  });

  if (!subscription) {
    return {
      plan: org?.planTier ?? PlanTier.free,
      billingInterval: BillingInterval.monthly,
      status: "active",
      currentPeriodStart: null,
      currentPeriodEnd: null,
      trialEnd: null,
      cancelAtPeriodEnd: false,
      stripeSubscriptionId: null,
    };
  }

  return {
    plan: subscription.plan,
    billingInterval: subscription.billingInterval,
    status: subscription.status,
    currentPeriodStart: subscription.currentPeriodStart?.toISOString() ?? null,
    currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
    trialEnd: subscription.trialEnd?.toISOString() ?? null,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    stripeSubscriptionId: subscription.stripeSubscriptionId,
  };
}

export async function changeSubscriptionPlan(input: {
  organizationId: string;
  userId: string;
  plan: PlanTier;
  interval?: BillingInterval;
}) {
  if (input.plan === PlanTier.free) {
    throw new BillingError("Use cancel to downgrade to free", "INVALID_PLAN");
  }

  const subscription = await prisma.subscription.findFirst({
    where: { organizationId: input.organizationId, isCurrent: true },
  });

  const interval = input.interval ?? subscription?.billingInterval ?? BillingInterval.monthly;
  const priceId = getStripePriceId(input.plan, interval);

  if (!priceId && !BILLING_CONFIG.mockStripe) {
    throw new BillingError(
      `Stripe price not configured for ${input.plan} (${interval})`,
      "PRICE_NOT_CONFIGURED",
    );
  }

  if (BILLING_CONFIG.mockStripe || !subscription) {
    const { syncMockSubscription } = await import("../stripe/checkout");
    const org = await prisma.organization.findUnique({
      where: { id: input.organizationId },
      select: { stripeCustomerId: true },
    });
    await syncMockSubscription({
      organizationId: input.organizationId,
      plan: input.plan,
      interval,
      customerId: org?.stripeCustomerId ?? `cus_mock_${input.organizationId.slice(0, 8)}`,
    });
    await writeBillingAuditLog({
      organizationId: input.organizationId,
      actorId: input.userId,
      action: "billing.subscription.changed",
      resourceType: "subscription",
      metadata: { plan: input.plan, interval, mock: true },
    });
    return { plan: input.plan, interval };
  }

  const stripe = getStripeClient();
  const stripeSub = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
  const itemId = stripeSub.items.data[0]?.id;

  if (!itemId) {
    throw new BillingError("Subscription has no items", "INVALID_SUBSCRIPTION", 500);
  }

  await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    items: [{ id: itemId, price: priceId! }],
    proration_behavior: "create_prorations",
    metadata: {
      organizationId: input.organizationId,
      planTier: input.plan,
      billingInterval: interval,
    },
  });

  await writeBillingAuditLog({
    organizationId: input.organizationId,
    actorId: input.userId,
    action: "billing.subscription.change_requested",
    resourceType: "subscription",
    resourceId: subscription.id,
    metadata: { plan: input.plan, interval },
  });

  return { plan: input.plan, interval, pending: true };
}

export async function syncSubscriptionFromStripe(
  stripeSubscription: import("stripe").Stripe.Subscription,
  organizationId: string,
) {
  const priceId = stripeSubscription.items.data[0]?.price?.id ?? null;
  const { planTierFromStripePrice, mapStripeSubscriptionStatus } = await import(
    "../stripe/client"
  );

  let plan: PlanTier = PlanTier.pro;
  let interval: BillingInterval = BillingInterval.monthly;

  if (priceId) {
    const mapped = planTierFromStripePrice(priceId);
    if (mapped) {
      plan = mapped.tier;
      interval = mapped.interval;
    }
  }

  const metadataPlan = stripeSubscription.metadata?.planTier as PlanTier | undefined;
  if (metadataPlan) plan = metadataPlan;

  const metadataInterval = stripeSubscription.metadata?.billingInterval as
    | BillingInterval
    | undefined;
  if (metadataInterval) interval = metadataInterval;

  const status = mapStripeSubscriptionStatus(stripeSubscription.status);
  const dbStatus =
    status === "cancelled"
      ? SubscriptionStatus.cancelled
      : (status as SubscriptionStatus);

  await prisma.$transaction(async (tx) => {
    await tx.subscription.updateMany({
      where: { organizationId, isCurrent: true },
      data: { isCurrent: false },
    });

    await tx.subscription.create({
      data: {
        organizationId,
        stripeSubscriptionId: stripeSubscription.id,
        stripePriceId: priceId,
        plan,
        billingInterval: interval,
        status: dbStatus,
        isCurrent: dbStatus !== SubscriptionStatus.cancelled,
        currentPeriodStart: stripeSubscription.current_period_start
          ? new Date(stripeSubscription.current_period_start * 1000)
          : null,
        currentPeriodEnd: stripeSubscription.current_period_end
          ? new Date(stripeSubscription.current_period_end * 1000)
          : null,
        trialEnd: stripeSubscription.trial_end
          ? new Date(stripeSubscription.trial_end * 1000)
          : null,
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        couponId:
          typeof stripeSubscription.discount?.coupon === "string"
            ? stripeSubscription.discount.coupon
            : stripeSubscription.discount?.coupon?.id ?? null,
        cancelledAt:
          dbStatus === SubscriptionStatus.cancelled ? new Date() : null,
      },
    });

    const effectivePlan =
      dbStatus === SubscriptionStatus.cancelled ? PlanTier.free : plan;

    await tx.organization.update({
      where: { id: organizationId },
      data: { planTier: effectivePlan },
    });
  });

  if (status === "active" || status === "trialing") {
    await grantMonthlyCredits(organizationId, plan);
  }
}
