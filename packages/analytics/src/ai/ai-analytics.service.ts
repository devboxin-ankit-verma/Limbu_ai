import { prisma } from "@limbu/db";
import type { AiAnalyticsSummary } from "../types";
import { parseDateRange, toDateKey, toTimeSeries, estimateTokensFromCredits } from "../utils/time";

export async function getAiAnalytics(
  organizationId: string,
  days = 30,
): Promise<AiAnalyticsSummary> {
  const { from } = parseDateRange(days);

  const records = await prisma.aiUsageRecord.findMany({
    where: { organizationId, createdAt: { gte: from } },
    select: {
      model: true,
      type: true,
      credits: true,
      costUsd: true,
      createdAt: true,
    },
  });

  let totalCredits = 0;
  let totalCostUsd = 0;
  const modelMap = new Map<string, { credits: number; costUsd: number; requests: number }>();
  const typeMap = new Map<string, { credits: number; requests: number }>();
  const tokensByDay = new Map<string, number>();
  const costByDay = new Map<string, number>();

  for (const r of records) {
    totalCredits += r.credits;
    totalCostUsd += Number(r.costUsd ?? 0);

    const modelEntry = modelMap.get(r.model) ?? { credits: 0, costUsd: 0, requests: 0 };
    modelEntry.credits += r.credits;
    modelEntry.costUsd += Number(r.costUsd ?? 0);
    modelEntry.requests++;
    modelMap.set(r.model, modelEntry);

    const typeKey = r.type;
    const typeEntry = typeMap.get(typeKey) ?? { credits: 0, requests: 0 };
    typeEntry.credits += r.credits;
    typeEntry.requests++;
    typeMap.set(typeKey, typeEntry);

    const dayKey = toDateKey(r.createdAt);
    tokensByDay.set(dayKey, (tokensByDay.get(dayKey) ?? 0) + estimateTokensFromCredits(r.credits));
    costByDay.set(dayKey, (costByDay.get(dayKey) ?? 0) + Number(r.costUsd ?? 0));
  }

  const usageSummaries = await prisma.usagePeriodSummary.findMany({
    where: {
      organizationId,
      category: "ai_tokens",
      periodStart: { gte: from },
    },
    select: { quantity: true, periodStart: true },
  });

  let totalTokensFromUsage = 0;
  for (const s of usageSummaries) {
    totalTokensFromUsage += Number(s.quantity);
  }

  const totalTokens =
    totalTokensFromUsage > 0 ? totalTokensFromUsage : estimateTokensFromCredits(totalCredits);

  return {
    totalTokens,
    totalCredits,
    totalCostUsd: Math.round(totalCostUsd * 100) / 100,
    byModel: [...modelMap.entries()]
      .map(([model, data]) => ({
        model,
        tokens: estimateTokensFromCredits(data.credits),
        credits: data.credits,
        costUsd: Math.round(data.costUsd * 100) / 100,
        requests: data.requests,
      }))
      .sort((a, b) => b.credits - a.credits),
    byType: [...typeMap.entries()]
      .map(([type, data]) => ({
        type,
        credits: data.credits,
        requests: data.requests,
      }))
      .sort((a, b) => b.credits - a.credits),
    dailyTokens: toTimeSeries(tokensByDay, Math.min(days, 30)),
    dailyCost: toTimeSeries(costByDay, Math.min(days, 30)),
  };
}

export async function getPlatformAiAnalytics(days = 30): Promise<AiAnalyticsSummary> {
  const { from } = parseDateRange(days);

  const records = await prisma.aiUsageRecord.findMany({
    where: { createdAt: { gte: from } },
    select: { model: true, type: true, credits: true, costUsd: true, createdAt: true },
  });

  let totalCredits = 0;
  let totalCostUsd = 0;
  const modelMap = new Map<string, { credits: number; costUsd: number; requests: number }>();
  const typeMap = new Map<string, { credits: number; requests: number }>();
  const tokensByDay = new Map<string, number>();
  const costByDay = new Map<string, number>();

  for (const r of records) {
    totalCredits += r.credits;
    totalCostUsd += Number(r.costUsd ?? 0);
    const modelEntry = modelMap.get(r.model) ?? { credits: 0, costUsd: 0, requests: 0 };
    modelEntry.credits += r.credits;
    modelEntry.costUsd += Number(r.costUsd ?? 0);
    modelEntry.requests++;
    modelMap.set(r.model, modelEntry);

    const typeEntry = typeMap.get(r.type) ?? { credits: 0, requests: 0 };
    typeEntry.credits += r.credits;
    typeEntry.requests++;
    typeMap.set(r.type, typeEntry);

    const dayKey = toDateKey(r.createdAt);
    tokensByDay.set(dayKey, (tokensByDay.get(dayKey) ?? 0) + estimateTokensFromCredits(r.credits));
    costByDay.set(dayKey, (costByDay.get(dayKey) ?? 0) + Number(r.costUsd ?? 0));
  }

  return {
    totalTokens: estimateTokensFromCredits(totalCredits),
    totalCredits,
    totalCostUsd: Math.round(totalCostUsd * 100) / 100,
    byModel: [...modelMap.entries()]
      .map(([model, data]) => ({
        model,
        tokens: estimateTokensFromCredits(data.credits),
        credits: data.credits,
        costUsd: Math.round(data.costUsd * 100) / 100,
        requests: data.requests,
      }))
      .sort((a, b) => b.credits - a.credits),
    byType: [...typeMap.entries()]
      .map(([type, data]) => ({ type, credits: data.credits, requests: data.requests }))
      .sort((a, b) => b.credits - a.credits),
    dailyTokens: toTimeSeries(tokensByDay, Math.min(days, 30)),
    dailyCost: toTimeSeries(costByDay, Math.min(days, 30)),
  };
}
