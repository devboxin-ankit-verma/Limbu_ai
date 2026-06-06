import { InvoiceStatus, prisma } from "@limbu/db";
import type { InvoiceSummary } from "../types";
import { mapStripeSubscriptionStatus } from "../stripe/client";
import type Stripe from "stripe";

export async function listInvoices(organizationId: string): Promise<InvoiceSummary[]> {
  const rows = await prisma.invoice.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    take: 24,
  });

  return rows.map((row) => ({
    id: row.id,
    stripeInvoiceId: row.stripeInvoiceId,
    amount: row.amount,
    currency: row.currency,
    status: row.status,
    pdfUrl: row.pdfUrl,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function syncInvoiceFromStripe(
  invoice: Stripe.Invoice,
  organizationId: string,
) {
  const statusMap: Record<string, InvoiceStatus> = {
    open: InvoiceStatus.open,
    paid: InvoiceStatus.paid,
    uncollectible: InvoiceStatus.uncollectible,
    void: InvoiceStatus.void,
  };

  const status = statusMap[invoice.status ?? "open"] ?? InvoiceStatus.open;

  await prisma.invoice.upsert({
    where: { stripeInvoiceId: invoice.id },
    create: {
      organizationId,
      stripeInvoiceId: invoice.id,
      amount: invoice.amount_due,
      currency: invoice.currency,
      status,
      pdfUrl: invoice.invoice_pdf ?? null,
    },
    update: {
      amount: invoice.amount_due,
      status,
      pdfUrl: invoice.invoice_pdf ?? null,
    },
  });

  if (status === InvoiceStatus.open || status === InvoiceStatus.uncollectible) {
    const { DunningStage } = await import("@limbu/db");
    await prisma.dunningEvent.create({
      data: {
        organizationId,
        stage:
          status === InvoiceStatus.uncollectible ? DunningStage.day_14 : DunningStage.day_0,
        stripeEventId: invoice.id,
      },
    });
  }
}

export { mapStripeSubscriptionStatus };
