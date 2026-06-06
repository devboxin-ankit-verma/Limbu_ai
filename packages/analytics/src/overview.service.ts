import type { AnalyticsOverview, ObservabilitySummary } from "./types";
import { getAiAnalytics, getPlatformAiAnalytics } from "./ai/ai-analytics.service";
import {
  getBusinessAnalytics,
  getOrgBusinessAnalytics,
} from "./business/business-analytics.service";
import { getProductAnalytics, getPlatformProductAnalytics } from "./product/product-analytics.service";
import { getErrorStats, listRecentErrors } from "./observability/errors.service";
import { getLatencyStats } from "./observability/latency.service";
import { getQueueHealthSummary } from "./observability/queue-health.service";
import { getWorkflowMetrics } from "./observability/workflow-metrics.service";

async function buildObservabilitySummary(
  organizationId?: string,
): Promise<ObservabilitySummary> {
  const dayAgo = new Date(Date.now() - 86400000);

  const [errorStats, recentErrors, latency, queues, workflows] = await Promise.all([
    getErrorStats(organizationId),
    listRecentErrors({ organizationId, limit: 10, since: dayAgo }),
    getLatencyStats(organizationId),
    getQueueHealthSummary(organizationId),
    getWorkflowMetrics(organizationId),
  ]);

  return {
    errors: {
      total24h: errorStats.total24h,
      total7d: errorStats.total7d,
      bySource: errorStats.bySource,
      recent: recentErrors.map((e) => ({
        id: e.id,
        source: e.source,
        message: e.message.slice(0, 200),
        severity: e.severity,
        createdAt: e.createdAt.toISOString(),
      })),
    },
    latency,
    queues,
    workflows,
  };
}

export async function getOrganizationAnalyticsOverview(
  organizationId: string,
  days = 30,
  includeBusiness = false,
): Promise<AnalyticsOverview> {
  const [product, ai, observability] = await Promise.all([
    getProductAnalytics(organizationId, days),
    getAiAnalytics(organizationId, days),
    buildObservabilitySummary(organizationId),
  ]);

  let business: AnalyticsOverview["business"];
  if (includeBusiness) {
    business = await getOrgBusinessAnalytics(organizationId, days);
  }

  return {
    product,
    ai,
    business,
    observability,
    generatedAt: new Date().toISOString(),
  };
}

export async function getPlatformAnalyticsOverview(days = 30): Promise<AnalyticsOverview> {
  const [product, ai, business, observability] = await Promise.all([
    getPlatformProductAnalytics(days),
    getPlatformAiAnalytics(days),
    getBusinessAnalytics(undefined, days),
    buildObservabilitySummary(),
  ]);

  return {
    product,
    ai,
    business,
    observability,
    generatedAt: new Date().toISOString(),
  };
}
