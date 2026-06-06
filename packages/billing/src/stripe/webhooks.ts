import { prisma } from "@limbu/db";
import type Stripe from "stripe";
import { BILLING_CONFIG, requireWebhookSecretConfigured } from "../config";
import { getStripeClient } from "./client";
import { syncSubscriptionFromStripe } from "../services/subscription.service";
import { syncInvoiceFromStripe } from "../services/invoice.service";
import { grantMonthlyCredits } from "../services/credit.service";
import { PlanTier } from "@limbu/db";

export async function handleStripeWebhook(
  rawBody: string,
  signature: string | null,
): Promise<{ received: boolean; type?: string }> {
  requireWebhookSecretConfigured();

  if (!signature) {
    throw new Error("Missing Stripe signature header");
  }

  const stripe = getStripeClient();
  const event = stripe.webhooks.constructEvent(
    rawBody,
    signature,
    BILLING_CONFIG.stripeWebhookSecret,
  );

  const existing = await prisma.stripeWebhookEvent.findUnique({
    where: { stripeEventId: event.id },
  });
  if (existing) {
    return { received: true, type: event.type };
  }

  await prisma.stripeWebhookEvent.create({
    data: {
      stripeEventId: event.id,
      type: event.type,
      payload: event.data.object as object,
    },
  });

  switch (event.type) {
    case "checkout.session.completed":
      await onCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    case "customer.subscription.created":
    case "customer.subscription.updated":
      await onSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;
    case "customer.subscription.deleted":
      await onSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;
    case "invoice.paid":
    case "invoice.payment_failed":
    case "invoice.finalized":
      await onInvoiceEvent(event.data.object as Stripe.Invoice);
      break;
    default:
      break;
  }

  return { received: true, type: event.type };
}

async function resolveOrganizationId(
  metadata: Stripe.Metadata | null | undefined,
  customerId?: string | Stripe.Customer | Stripe.DeletedCustomer | null,
): Promise<string | null> {
  if (metadata?.organizationId) return metadata.organizationId;

  const custId = typeof customerId === "string" ? customerId : customerId?.id;
  if (!custId) return null;

  const org = await prisma.organization.findFirst({
    where: { stripeCustomerId: custId },
    select: { id: true },
  });
  return org?.id ?? null;
}

async function onCheckoutCompleted(session: Stripe.Checkout.Session) {
  const organizationId = await resolveOrganizationId(
    session.metadata,
    session.customer,
  );
  if (!organizationId || !session.subscription) return;

  if (BILLING_CONFIG.mockStripe) return;

  const stripe = getStripeClient();
  const subId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription.id;

  const subscription = await stripe.subscriptions.retrieve(subId);
  await syncSubscriptionFromStripe(subscription, organizationId);
}

async function onSubscriptionUpdated(subscription: Stripe.Subscription) {
  const organizationId = await resolveOrganizationId(
    subscription.metadata,
    subscription.customer,
  );
  if (!organizationId) return;
  await syncSubscriptionFromStripe(subscription, organizationId);
}

async function onSubscriptionDeleted(subscription: Stripe.Subscription) {
  const organizationId = await resolveOrganizationId(
    subscription.metadata,
    subscription.customer,
  );
  if (!organizationId) return;

  await prisma.$transaction(async (tx) => {
    await tx.subscription.updateMany({
      where: { organizationId, stripeSubscriptionId: subscription.id },
      data: {
        isCurrent: false,
        status: "cancelled",
        cancelledAt: new Date(),
      },
    });

    await tx.organization.update({
      where: { id: organizationId },
      data: { planTier: PlanTier.free },
    });
  });

  await grantMonthlyCredits(organizationId, PlanTier.free);
}

async function onInvoiceEvent(invoice: Stripe.Invoice) {
  const organizationId = await resolveOrganizationId(
    invoice.metadata,
    invoice.customer,
  );
  if (!organizationId) return;
  await syncInvoiceFromStripe(invoice, organizationId);
}
