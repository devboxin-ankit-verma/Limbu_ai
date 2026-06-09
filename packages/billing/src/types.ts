import type { BillingInterval, PlanTier } from "@limbu/db";

export type PlanFeatures = {
  channels: string[];
  approvalWorkflows: boolean;
  knowledgeBaseRag: boolean;
  aiAgents: boolean;
  workflows: boolean;
  sso: boolean;
  maxStorageMb: number;
  maxKnowledgeDocuments: number;
  maxAgentRunsPerMonth: number;
  maxWorkflowRunsPerMonth: number;
  gmbPublishing: boolean;
  reviewAutoReply: boolean;
  magicQr: boolean;
  maxLocations: number | null;
};

export type PlanDefinition = {
  tier: PlanTier;
  name: string;
  description: string;
  monthlyPriceUsd: number | null;
  annualPriceUsd: number | null;
  trialDays: number;
  popular?: boolean;
  contactSales?: boolean;
};

export type CheckoutSessionResult = {
  url: string;
  sessionId: string;
};

export type SubscriptionSummary = {
  plan: PlanTier;
  billingInterval: BillingInterval;
  status: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  trialEnd: string | null;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId: string | null;
};

export type UsageSummary = {
  periodStart: string;
  periodEnd: string;
  metrics: Record<
    string,
    { quantity: number; limit: number | null; unit: string }
  >;
  credits: {
    balance: number;
    reserved: number;
    monthlyAllowance: number;
    usedThisPeriod: number;
  };
};

export type InvoiceSummary = {
  id: string;
  stripeInvoiceId: string;
  amount: number;
  currency: string;
  status: string;
  pdfUrl: string | null;
  createdAt: string;
};

export type EntitlementUpdate = {
  maxWorkspaces?: number;
  maxMembers?: number;
  monthlyCredits?: number;
  maxPostsPerMonth?: number | null;
  features?: Partial<PlanFeatures>;
};
