import {
  CreditReferenceType,
  CreditTransactionType,
  PlanTier,
  prisma,
  UsageMetricCategory,
} from "@limbu/db";
import { BillingQuotaExceededError } from "../errors";

function currentBillingPeriod(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { start, end };
}

export async function initializeCreditBalance(organizationId: string, plan: PlanTier = PlanTier.free) {
  const entitlement = await prisma.planEntitlement.findUnique({
    where: { planTier: plan },
    select: { monthlyCredits: true },
  });

  const credits = entitlement?.monthlyCredits ?? 50;
  const { end } = currentBillingPeriod();

  await prisma.creditBalance.upsert({
    where: { organizationId },
    create: {
      organizationId,
      balance: credits,
      resetAt: end,
    },
    update: {},
  });
}

export async function grantMonthlyCredits(organizationId: string, plan: PlanTier) {
  const entitlement = await prisma.planEntitlement.findUnique({
    where: { planTier: plan },
    select: { monthlyCredits: true },
  });

  const credits = entitlement?.monthlyCredits ?? 50;
  const { end } = currentBillingPeriod();

  await prisma.$transaction(async (tx) => {
    const existing = await tx.creditBalance.findUnique({
      where: { organizationId },
    });

    if (existing) {
      await tx.creditBalance.update({
        where: { organizationId },
        data: { balance: credits, reserved: 0, resetAt: end },
      });
    } else {
      await tx.creditBalance.create({
        data: { organizationId, balance: credits, resetAt: end },
      });
    }

    await tx.creditTransaction.create({
      data: {
        organizationId,
        amount: credits,
        type: CreditTransactionType.grant,
        referenceType: CreditReferenceType.subscription,
        reason: `Monthly credit grant (${plan})`,
      },
    });
  });
}

export async function getCreditBalance(organizationId: string) {
  let balance = await prisma.creditBalance.findUnique({
    where: { organizationId },
  });

  if (!balance) {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { planTier: true },
    });
    await initializeCreditBalance(organizationId, org?.planTier ?? PlanTier.free);
    balance = await prisma.creditBalance.findUnique({
      where: { organizationId },
    });
  }

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { planTier: true },
  });
  const entitlement = await prisma.planEntitlement.findUnique({
    where: { planTier: org?.planTier ?? PlanTier.free },
    select: { monthlyCredits: true },
  });

  const { start } = currentBillingPeriod();
  const usedAgg = await prisma.usagePeriodSummary.findUnique({
    where: {
      organizationId_periodStart_category: {
        organizationId,
        periodStart: start,
        category: UsageMetricCategory.ai_credits,
      },
    },
  });

  return {
    balance: balance?.balance ?? 0,
    reserved: balance?.reserved ?? 0,
    resetAt: balance?.resetAt?.toISOString() ?? null,
    monthlyAllowance: entitlement?.monthlyCredits ?? 50,
    usedThisPeriod: Number(usedAgg?.quantity ?? 0),
  };
}

export async function assertCreditsAvailable(organizationId: string, amount: number) {
  const { balance, reserved } = await getCreditBalance(organizationId);
  const available = balance - reserved;
  if (available < amount) {
    throw new BillingQuotaExceededError(
      `Insufficient credits. Need ${amount}, have ${available} available.`,
      "ai_credits",
    );
  }
}

export async function consumeCredits(input: {
  organizationId: string;
  amount: number;
  referenceType: CreditReferenceType;
  referenceId?: string;
  reason?: string;
}) {
  if (input.amount <= 0) return;

  await prisma.$transaction(async (tx) => {
    const balance = await tx.creditBalance.findUnique({
      where: { organizationId: input.organizationId },
    });

    if (!balance || balance.balance - balance.reserved < input.amount) {
      throw new BillingQuotaExceededError(
        "Insufficient credits for this operation",
        "ai_credits",
      );
    }

    await tx.creditBalance.update({
      where: { organizationId: input.organizationId },
      data: { balance: { decrement: input.amount } },
    });

    await tx.creditTransaction.create({
      data: {
        organizationId: input.organizationId,
        amount: -input.amount,
        type: CreditTransactionType.commit,
        referenceType: input.referenceType,
        referenceId: input.referenceId,
        reason: input.reason,
      },
    });
  });

  const { trackUsage } = await import("./usage.service");
  await trackUsage({
    organizationId: input.organizationId,
    category: UsageMetricCategory.ai_credits,
    quantity: input.amount,
    referenceId: input.referenceId,
  });
}
