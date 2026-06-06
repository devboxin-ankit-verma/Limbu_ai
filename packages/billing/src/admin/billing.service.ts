import { PlanTier, prisma } from "@limbu/db";
import { getSubscriptionSummary } from "../services/subscription.service";
import { getUsageSummary } from "../services/usage.service";
import { getCreditBalance } from "../services/credit.service";
import { listInvoices } from "../services/invoice.service";

export async function getOrganizationBillingOverview(organizationId: string) {
  const [subscription, usage, credits, invoices, org] = await Promise.all([
    getSubscriptionSummary(organizationId),
    getUsageSummary(organizationId),
    getCreditBalance(organizationId),
    listInvoices(organizationId),
    prisma.organization.findUnique({
      where: { id: organizationId },
      select: { planTier: true, stripeCustomerId: true, name: true },
    }),
  ]);

  return {
    organization: org,
    subscription,
    usage,
    credits,
    invoices,
  };
}

export async function listOrganizationsBilling(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [rows, total] = await Promise.all([
    prisma.organization.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        planTier: true,
        stripeCustomerId: true,
        createdAt: true,
        creditBalance: { select: { balance: true } },
        subscriptions: {
          where: { isCurrent: true },
          take: 1,
          select: { status: true, plan: true, billingInterval: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.organization.count({ where: { deletedAt: null } }),
  ]);

  return { organizations: rows, total, page, limit };
}

export async function adminGrantCredits(input: {
  organizationId: string;
  amount: number;
  actorId: string;
  reason?: string;
}) {
  const { CreditTransactionType, CreditReferenceType } = await import("@limbu/db");
  const { writeBillingAuditLog } = await import("../audit");

  await prisma.$transaction(async (tx) => {
    await tx.creditBalance.upsert({
      where: { organizationId: input.organizationId },
      create: { organizationId: input.organizationId, balance: input.amount },
      update: { balance: { increment: input.amount } },
    });

    await tx.creditTransaction.create({
      data: {
        organizationId: input.organizationId,
        amount: input.amount,
        type: CreditTransactionType.grant,
        referenceType: CreditReferenceType.admin_grant,
        reason: input.reason ?? "Admin credit grant",
      },
    });
  });

  await writeBillingAuditLog({
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "billing.credits.granted",
    resourceType: "credit_balance",
    metadata: { amount: input.amount, reason: input.reason },
  });
}

export async function adminSetPlan(input: {
  organizationId: string;
  plan: PlanTier;
  actorId: string;
}) {
  const { grantMonthlyCredits } = await import("../services/credit.service");
  const { writeBillingAuditLog } = await import("../audit");

  await prisma.organization.update({
    where: { id: input.organizationId },
    data: { planTier: input.plan },
  });

  await grantMonthlyCredits(input.organizationId, input.plan);

  await writeBillingAuditLog({
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "billing.plan.set",
    resourceType: "organization",
    resourceId: input.organizationId,
    metadata: { plan: input.plan },
  });
}
