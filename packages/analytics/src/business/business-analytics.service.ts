import {
  BillingInterval,
  InvoiceStatus,
  PlanTier,
  prisma,
  SubscriptionStatus,
} from "@limbu/db";
import { getPlanDefinition } from "@limbu/billing";
import type { BusinessAnalyticsSummary } from "../types";
import { parseDateRange, toDateKey, toTimeSeries } from "../utils/time";

function monthlyPriceForPlan(plan: PlanTier, interval: BillingInterval): number {
  const def = getPlanDefinition(plan);
  if (plan === PlanTier.enterprise || def.monthlyPriceUsd === null) return 0;
  if (interval === BillingInterval.annual && def.annualPriceUsd) {
    return Math.round((def.annualPriceUsd / 12) * 100) / 100;
  }
  return def.monthlyPriceUsd ?? 0;
}

export async function getBusinessAnalytics(
  organizationId?: string,
  days = 30,
): Promise<BusinessAnalyticsSummary> {
  const { from } = parseDateRange(days);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30);

  const subWhere = organizationId
    ? { organizationId, isCurrent: true, status: { in: [SubscriptionStatus.active, SubscriptionStatus.trialing] } }
    : { isCurrent: true, status: { in: [SubscriptionStatus.active, SubscriptionStatus.trialing] } };

  const activeSubs = await prisma.subscription.findMany({
    where: subWhere,
    select: { plan: true, billingInterval: true, organizationId: true },
  });

  let mrr = 0;
  const planCounts = new Map<string, { count: number; mrr: number }>();

  for (const sub of activeSubs) {
    const monthly = monthlyPriceForPlan(sub.plan, sub.billingInterval);
    mrr += monthly;
    const entry = planCounts.get(sub.plan) ?? { count: 0, mrr: 0 };
    entry.count++;
    entry.mrr += monthly;
    planCounts.set(sub.plan, entry);
  }

  const invoiceWhere = organizationId
    ? { organizationId, status: InvoiceStatus.paid, createdAt: { gte: thirtyDaysAgo } }
    : { status: InvoiceStatus.paid, createdAt: { gte: thirtyDaysAgo } };

  const paidInvoices = await prisma.invoice.findMany({
    where: invoiceWhere,
    select: { amount: true, createdAt: true },
  });

  const revenue30d = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0) / 100;

  const cancelWhere = organizationId
    ? {
        organizationId,
        status: SubscriptionStatus.cancelled,
        cancelledAt: { gte: thirtyDaysAgo },
      }
    : { status: SubscriptionStatus.cancelled, cancelledAt: { gte: thirtyDaysAgo } };

  const cancelled30d = await prisma.subscription.count({ where: cancelWhere });

  const startCount = activeSubs.length + cancelled30d;
  const churnRate30d = startCount > 0 ? cancelled30d / startCount : 0;

  const revenueByDay = new Map<string, number>();
  for (const inv of paidInvoices) {
    const key = toDateKey(inv.createdAt);
    revenueByDay.set(key, (revenueByDay.get(key) ?? 0) + inv.amount / 100);
  }

  return {
    mrr: Math.round(mrr * 100) / 100,
    arr: Math.round(mrr * 12 * 100) / 100,
    revenue30d: Math.round(revenue30d * 100) / 100,
    activeSubscriptions: activeSubs.length,
    churnRate30d: Math.round(churnRate30d * 1000) / 1000,
    cancelled30d,
    planBreakdown: [...planCounts.entries()]
      .map(([plan, data]) => ({
        plan,
        count: data.count,
        mrr: Math.round(data.mrr * 100) / 100,
      }))
      .sort((a, b) => b.mrr - a.mrr),
    revenueTrend: toTimeSeries(revenueByDay, 30),
  };
}

export async function getOrgBusinessAnalytics(
  organizationId: string,
  days = 30,
): Promise<BusinessAnalyticsSummary> {
  return getBusinessAnalytics(organizationId, days);
}
