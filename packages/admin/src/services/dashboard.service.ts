import { OrgStatus, PlanTier, prisma, SubscriptionStatus } from "@limbu/db";
import { getBusinessAnalytics } from "@limbu/analytics";
import { getErrorStats } from "@limbu/analytics";
import type { AdminDashboardSummary } from "../types";
import { getSystemHealth } from "./health.service";

export async function getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);

  const [
    totalUsers,
    superAdmins,
    activeUsers7d,
    totalOrgs,
    activeOrgs,
    suspendedOrgs,
    activeSubs,
    trialingSubs,
    cancelled30d,
    revenue,
    health,
  ] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { deletedAt: null, isSuperAdmin: true } }),
    prisma.session.findMany({
      where: { createdAt: { gte: weekAgo } },
      distinct: ["userId"],
      select: { userId: true },
    }),
    prisma.organization.count({ where: { deletedAt: null } }),
    prisma.organization.count({ where: { deletedAt: null, status: OrgStatus.active } }),
    prisma.organization.count({ where: { deletedAt: null, status: OrgStatus.suspended } }),
    prisma.subscription.count({
      where: { isCurrent: true, status: SubscriptionStatus.active },
    }),
    prisma.subscription.count({
      where: { isCurrent: true, status: SubscriptionStatus.trialing },
    }),
    prisma.subscription.count({
      where: { status: SubscriptionStatus.cancelled, cancelledAt: { gte: thirtyDaysAgo } },
    }),
    getBusinessAnalytics(undefined, 30),
    getSystemHealth(),
  ]);

  return {
    users: {
      total: totalUsers,
      superAdmins,
      active7d: activeUsers7d.length,
    },
    organizations: {
      total: totalOrgs,
      active: activeOrgs,
      suspended: suspendedOrgs,
    },
    subscriptions: {
      active: activeSubs,
      trialing: trialingSubs,
      cancelled30d,
    },
    revenue: {
      mrr: revenue.mrr,
      arr: revenue.arr,
      revenue30d: revenue.revenue30d,
    },
    health: {
      status: health.status,
      errors24h: health.errors.last24h,
    },
  };
}
