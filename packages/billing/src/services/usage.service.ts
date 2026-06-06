import { UsageMetricCategory, prisma } from "@limbu/db";
import type { UsageSummary } from "../types";
import { getOrganizationEntitlements, type OrganizationEntitlements } from "./entitlement.service";
import { getCreditBalance } from "./credit.service";
import { DEFAULT_PLAN_FEATURES } from "../plans/catalog";

function currentBillingPeriod(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { start, end };
}

const CATEGORY_UNITS: Record<UsageMetricCategory, string> = {
  ai_tokens: "tokens",
  ai_credits: "credits",
  storage_bytes: "bytes",
  knowledge_base_documents: "documents",
  agent_runs: "runs",
  workflow_runs: "runs",
};

const CATEGORY_LIMITS: Record<
  UsageMetricCategory,
  (entitlements: OrganizationEntitlements) => number | null
> = {
  ai_tokens: () => null,
  ai_credits: (e) => e.monthlyCredits,
  storage_bytes: (e) => (e.features.maxStorageMb ?? 100) * 1024 * 1024,
  knowledge_base_documents: (e) => e.features.maxKnowledgeDocuments ?? 5,
  agent_runs: (e) => e.features.maxAgentRunsPerMonth ?? 0,
  workflow_runs: (e) => e.features.maxWorkflowRunsPerMonth ?? 0,
};

export async function trackUsage(input: {
  organizationId: string;
  category: UsageMetricCategory;
  quantity: number;
  referenceId?: string;
}) {
  if (input.quantity <= 0) return;

  const { start, end } = currentBillingPeriod();

  await prisma.usagePeriodSummary.upsert({
    where: {
      organizationId_periodStart_category: {
        organizationId: input.organizationId,
        periodStart: start,
        category: input.category,
      },
    },
    create: {
      organizationId: input.organizationId,
      periodStart: start,
      periodEnd: end,
      category: input.category,
      quantity: BigInt(input.quantity),
    },
    update: {
      quantity: { increment: BigInt(input.quantity) },
    },
  });
}

export async function trackAiTokenUsage(input: {
  organizationId: string;
  tokens: number;
  credits: number;
  referenceId?: string;
}) {
  await trackUsage({
    organizationId: input.organizationId,
    category: UsageMetricCategory.ai_tokens,
    quantity: input.tokens,
    referenceId: input.referenceId,
  });
}

export async function getUsageSummary(organizationId: string): Promise<UsageSummary> {
  const { start, end } = currentBillingPeriod();
  const entitlements = await getOrganizationEntitlements(organizationId);
  const credits = await getCreditBalance(organizationId);

  const summaries = await prisma.usagePeriodSummary.findMany({
    where: { organizationId, periodStart: start },
  });

  const metrics: UsageSummary["metrics"] = {};

  for (const category of Object.values(UsageMetricCategory)) {
    const row = summaries.find((s) => s.category === category);
    const quantity = Number(row?.quantity ?? 0);
    const limitFn = CATEGORY_LIMITS[category];
    const limit = limitFn(entitlements);
    metrics[category] = {
      quantity,
      limit,
      unit: CATEGORY_UNITS[category],
    };
  }

  return {
    periodStart: start.toISOString(),
    periodEnd: end.toISOString(),
    metrics,
    credits,
  };
}

export async function assertUsageQuota(
  organizationId: string,
  category: UsageMetricCategory,
  additionalQuantity = 1,
) {
  const summary = await getUsageSummary(organizationId);
  const metric = summary.metrics[category];
  if (metric.limit === null) return;

  if (metric.quantity + additionalQuantity > metric.limit) {
    const { BillingQuotaExceededError } = await import("../errors");
    throw new BillingQuotaExceededError(
      `${category} quota exceeded (${metric.quantity}/${metric.limit})`,
      category,
    );
  }
}

export { DEFAULT_PLAN_FEATURES };
