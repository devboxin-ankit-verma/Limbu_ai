export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

export type AdminDashboardSummary = {
  users: { total: number; superAdmins: number; active7d: number };
  organizations: { total: number; active: number; suspended: number };
  subscriptions: { active: number; trialing: number; cancelled30d: number };
  revenue: { mrr: number; arr: number; revenue30d: number };
  health: { status: "healthy" | "degraded" | "unhealthy"; errors24h: number };
};

export type AdminUserSummary = {
  id: string;
  email: string;
  name: string | null;
  isSuperAdmin: boolean;
  emailVerified: string | null;
  createdAt: string;
  organizationCount: number;
  deletedAt: string | null;
};

export type AdminOrgSummary = {
  id: string;
  name: string;
  slug: string;
  planTier: string;
  status: string;
  memberCount: number;
  workspaceCount: number;
  ownerEmail: string | null;
  createdAt: string;
};

export type AdminWorkspaceSummary = {
  id: string;
  name: string;
  organizationId: string;
  organizationName: string;
  status: string;
  memberCount: number;
  createdAt: string;
};

export type AdminSubscriptionRow = {
  id: string;
  organizationId: string;
  organizationName: string;
  plan: string;
  billingInterval: string;
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
};

export type AdminAuditLogRow = {
  id: string;
  organizationId: string;
  organizationName: string;
  actorId: string | null;
  actorEmail: string | null;
  action: string;
  resourceType: string;
  resourceId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type AdminFeatureFlagRow = {
  key: string;
  defaultValue: boolean;
  description: string | null;
  overrideCount: number;
};

export type SystemHealthReport = {
  status: "healthy" | "degraded" | "unhealthy";
  database: { ok: boolean; latencyMs: number };
  queues: {
    workflow: { pending: number; failed: number };
    rag: { pending: number; failed: number };
    deadLetterOpen: number;
  };
  errors: { last24h: number; last7d: number };
  workflows: { successRate24h: number; totalRuns24h: number };
  version: string;
  checkedAt: string;
};
