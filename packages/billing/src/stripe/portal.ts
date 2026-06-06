import { prisma } from "@limbu/db";
import { writeBillingAuditLog } from "../audit";
import { BILLING_CONFIG } from "../config";
import { BillingError } from "../errors";
import { getOrCreateStripeCustomer } from "./checkout";
import { getStripeClient } from "./client";

export async function createCustomerPortalSession(input: {
  organizationId: string;
  userId: string;
  email: string;
}): Promise<{ url: string }> {
  const customerId = await getOrCreateStripeCustomer({
    organizationId: input.organizationId,
    email: input.email,
  });

  const returnUrl = `${BILLING_CONFIG.appUrl}/organizations/${input.organizationId}/billing`;

  if (BILLING_CONFIG.mockStripe) {
    return { url: `${returnUrl}?portal=mock` };
  }

  const stripe = getStripeClient();
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  await writeBillingAuditLog({
    organizationId: input.organizationId,
    actorId: input.userId,
    action: "billing.portal.opened",
    resourceType: "portal_session",
    resourceId: session.id,
  });

  return { url: session.url };
}

export async function cancelSubscription(input: {
  organizationId: string;
  userId: string;
  cancelAtPeriodEnd: boolean;
}) {
  const subscription = await prisma.subscription.findFirst({
    where: { organizationId: input.organizationId, isCurrent: true },
  });

  if (!subscription) {
    throw new BillingError("No active subscription found", "NO_SUBSCRIPTION", 404);
  }

  if (BILLING_CONFIG.mockStripe) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd: input.cancelAtPeriodEnd,
        ...(input.cancelAtPeriodEnd
          ? {}
          : { status: "cancelled", cancelledAt: new Date(), isCurrent: false }),
      },
    });

    if (!input.cancelAtPeriodEnd) {
      await prisma.organization.update({
        where: { id: input.organizationId },
        data: { planTier: "free" },
      });
    }

    await writeBillingAuditLog({
      organizationId: input.organizationId,
      actorId: input.userId,
      action: "billing.subscription.cancelled",
      resourceType: "subscription",
      resourceId: subscription.id,
      metadata: { cancelAtPeriodEnd: input.cancelAtPeriodEnd, mock: true },
    });
    return { cancelAtPeriodEnd: input.cancelAtPeriodEnd };
  }

  const stripe = getStripeClient();
  if (input.cancelAtPeriodEnd) {
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { cancelAtPeriodEnd: true },
    });
  } else {
    await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
  }

  await writeBillingAuditLog({
    organizationId: input.organizationId,
    actorId: input.userId,
    action: "billing.subscription.cancelled",
    resourceType: "subscription",
    resourceId: subscription.id,
    metadata: { cancelAtPeriodEnd: input.cancelAtPeriodEnd },
  });

  return { cancelAtPeriodEnd: input.cancelAtPeriodEnd };
}

export async function reactivateSubscription(input: {
  organizationId: string;
  userId: string;
}) {
  const subscription = await prisma.subscription.findFirst({
    where: { organizationId: input.organizationId, isCurrent: true },
  });

  if (!subscription) {
    throw new BillingError("No active subscription found", "NO_SUBSCRIPTION", 404);
  }

  if (BILLING_CONFIG.mockStripe) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { cancelAtPeriodEnd: false },
    });
    return { reactivated: true };
  }

  const stripe = getStripeClient();
  await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    cancel_at_period_end: false,
  });

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { cancelAtPeriodEnd: false },
  });

  await writeBillingAuditLog({
    organizationId: input.organizationId,
    actorId: input.userId,
    action: "billing.subscription.reactivated",
    resourceType: "subscription",
    resourceId: subscription.id,
  });

  return { reactivated: true };
}
