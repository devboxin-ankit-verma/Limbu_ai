export type DateRange = {
  from: Date;
  to: Date;
};

export type TimeSeriesPoint = {
  date: string;
  value: number;
};

export type ProductAnalyticsSummary = {
  dau: number;
  wau: number;
  mau: number;
  dauTrend: TimeSeriesPoint[];
  retention: {
    day1: number;
    day7: number;
    day30: number;
    cohortSize: number;
  };
  featureUsage: Array<{ feature: string; count: number; uniqueUsers: number }>;
};

export type AiAnalyticsSummary = {
  totalTokens: number;
  totalCredits: number;
  totalCostUsd: number;
  byModel: Array<{
    model: string;
    tokens: number;
    credits: number;
    costUsd: number;
    requests: number;
  }>;
  byType: Array<{ type: string; credits: number; requests: number }>;
  dailyTokens: TimeSeriesPoint[];
  dailyCost: TimeSeriesPoint[];
};

export type BusinessAnalyticsSummary = {
  mrr: number;
  arr: number;
  revenue30d: number;
  activeSubscriptions: number;
  churnRate30d: number;
  cancelled30d: number;
  planBreakdown: Array<{ plan: string; count: number; mrr: number }>;
  revenueTrend: TimeSeriesPoint[];
};

export type ObservabilitySummary = {
  errors: {
    total24h: number;
    total7d: number;
    bySource: Array<{ source: string; count: number }>;
    recent: Array<{
      id: string;
      source: string;
      message: string;
      severity: string;
      createdAt: string;
    }>;
  };
  latency: {
    p50Ms: number;
    p95Ms: number;
    p99Ms: number;
    byEndpoint: Array<{ name: string; p50Ms: number; p95Ms: number; count: number }>;
  };
  queues: {
    workflow: QueueHealth;
    rag: QueueHealth;
    deadLetter: { open: number; total: number };
  };
  workflows: {
    totalRuns24h: number;
    failedRuns24h: number;
    successRate: number;
    avgDurationMs: number;
  };
};

export type QueueHealth = {
  pending: number;
  processing: number;
  failed: number;
  completed24h: number;
};

export type AnalyticsOverview = {
  product: ProductAnalyticsSummary;
  ai: AiAnalyticsSummary;
  business?: BusinessAnalyticsSummary;
  observability: ObservabilitySummary;
  generatedAt: string;
};
