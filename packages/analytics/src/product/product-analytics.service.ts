import { prisma } from "@limbu/db";
import type { ProductAnalyticsSummary } from "../types";
import { parseDateRange, toDateKey, toTimeSeries } from "../utils/time";

function daysAgo(n: number): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export async function getProductAnalytics(
  organizationId: string,
  days = 30,
): Promise<ProductAnalyticsSummary> {
  const { from } = parseDateRange(days);

  const events = await prisma.productEvent.findMany({
    where: { organizationId, createdAt: { gte: from } },
    select: { userId: true, eventName: true, createdAt: true },
  });

  const dauSet = new Set<string>();
  const wauSet = new Set<string>();
  const mauSet = new Set<string>();

  const dayStart = daysAgo(0);
  const weekStart = daysAgo(7);
  const monthStart = daysAgo(30);

  for (const e of events) {
    if (!e.userId) continue;
    mauSet.add(e.userId);
    if (e.createdAt >= weekStart) wauSet.add(e.userId);
    if (e.createdAt >= dayStart) dauSet.add(e.userId);
  }

  const dauByDay = new Map<string, Set<string>>();
  for (const e of events) {
    if (!e.userId) continue;
    const key = toDateKey(e.createdAt);
    if (!dauByDay.has(key)) dauByDay.set(key, new Set());
    dauByDay.get(key)!.add(e.userId);
  }

  const dauTrend = toTimeSeries(
    new Map([...dauByDay.entries()].map(([k, v]) => [k, v.size])),
    Math.min(days, 30),
  );

  const retention = await computeRetention(organizationId);

  const featureMap = new Map<string, { count: number; users: Set<string> }>();
  for (const e of events) {
    if (!featureMap.has(e.eventName)) {
      featureMap.set(e.eventName, { count: 0, users: new Set() });
    }
    const entry = featureMap.get(e.eventName)!;
    entry.count++;
    if (e.userId) entry.users.add(e.userId);
  }

  const featureUsage = [...featureMap.entries()]
    .map(([feature, data]) => ({
      feature,
      count: data.count,
      uniqueUsers: data.users.size,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  return {
    dau: dauSet.size,
    wau: wauSet.size,
    mau: mauSet.size,
    dauTrend,
    retention,
    featureUsage,
  };
}

async function computeRetention(organizationId: string) {
  const cohortStart = daysAgo(30);
  const cohortEnd = daysAgo(23);

  const cohortEvents = await prisma.productEvent.findMany({
    where: {
      organizationId,
      createdAt: { gte: cohortStart, lt: cohortEnd },
    },
    select: { userId: true, createdAt: true },
    distinct: ["userId"],
  });

  const cohortUsers = cohortEvents.map((e) => e.userId).filter(Boolean) as string[];
  const cohortSize = cohortUsers.length;

  if (cohortSize === 0) {
    return { day1: 0, day7: 0, day30: 0, cohortSize: 0 };
  }

  const firstSeen = new Map<string, Date>();
  for (const e of cohortEvents) {
    if (e.userId) firstSeen.set(e.userId, e.createdAt);
  }

  const laterEvents = await prisma.productEvent.findMany({
    where: {
      organizationId,
      userId: { in: cohortUsers },
      createdAt: { gte: cohortStart },
    },
    select: { userId: true, createdAt: true },
  });

  let day1 = 0;
  let day7 = 0;
  let day30 = 0;

  for (const userId of cohortUsers) {
    const start = firstSeen.get(userId)!;
    const userEvents = laterEvents.filter((e) => e.userId === userId);
    const day1End = new Date(start);
    day1End.setUTCDate(day1End.getUTCDate() + 1);
    const day7End = new Date(start);
    day7End.setUTCDate(day7End.getUTCDate() + 7);
    const day30End = new Date(start);
    day30End.setUTCDate(day30End.getUTCDate() + 30);

    if (userEvents.some((e) => e.createdAt >= start && e.createdAt < day1End)) day1++;
    if (userEvents.some((e) => e.createdAt >= day7End && e.createdAt < new Date(day7End.getTime() + 86400000))) day7++;
    if (userEvents.some((e) => e.createdAt >= day30End)) day30++;
  }

  return {
    day1: cohortSize > 0 ? day1 / cohortSize : 0,
    day7: cohortSize > 0 ? day7 / cohortSize : 0,
    day30: cohortSize > 0 ? day30 / cohortSize : 0,
    cohortSize,
  };
}

export async function getPlatformProductAnalytics(days = 30): Promise<ProductAnalyticsSummary> {
  const { from } = parseDateRange(days);

  const events = await prisma.productEvent.findMany({
    where: { createdAt: { gte: from } },
    select: { userId: true, eventName: true, createdAt: true },
  });

  const dayStart = daysAgo(0);
  const weekStart = daysAgo(7);
  const monthStart = daysAgo(30);

  const dauSet = new Set<string>();
  const wauSet = new Set<string>();
  const mauSet = new Set<string>();

  for (const e of events) {
    if (!e.userId) continue;
    mauSet.add(e.userId);
    if (e.createdAt >= weekStart) wauSet.add(e.userId);
    if (e.createdAt >= dayStart) dauSet.add(e.userId);
  }

  const dauByDay = new Map<string, Set<string>>();
  for (const e of events) {
    if (!e.userId) continue;
    const key = toDateKey(e.createdAt);
    if (!dauByDay.has(key)) dauByDay.set(key, new Set());
    dauByDay.get(key)!.add(e.userId);
  }

  const featureMap = new Map<string, { count: number; users: Set<string> }>();
  for (const e of events) {
    if (!featureMap.has(e.eventName)) {
      featureMap.set(e.eventName, { count: 0, users: new Set() });
    }
    const entry = featureMap.get(e.eventName)!;
    entry.count++;
    if (e.userId) entry.users.add(e.userId);
  }

  return {
    dau: dauSet.size,
    wau: wauSet.size,
    mau: mauSet.size,
    dauTrend: toTimeSeries(
      new Map([...dauByDay.entries()].map(([k, v]) => [k, v.size])),
      Math.min(days, 30),
    ),
    retention: { day1: 0, day7: 0, day30: 0, cohortSize: 0 },
    featureUsage: [...featureMap.entries()]
      .map(([feature, data]) => ({
        feature,
        count: data.count,
        uniqueUsers: data.users.size,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20),
  };
}
