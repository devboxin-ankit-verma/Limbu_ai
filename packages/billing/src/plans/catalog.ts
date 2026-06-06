import { PlanTier } from "@limbu/db";
import type { PlanDefinition, PlanFeatures } from "../types";

export const PLAN_CATALOG: PlanDefinition[] = [
  {
    tier: PlanTier.free,
    name: "Free",
    description: "Get started with core AI chat and one workspace.",
    monthlyPriceUsd: 0,
    annualPriceUsd: 0,
    trialDays: 0,
  },
  {
    tier: PlanTier.starter,
    name: "Starter",
    description: "For solo marketers exploring AI-powered workflows.",
    monthlyPriceUsd: 29,
    annualPriceUsd: 290,
    trialDays: 14,
  },
  {
    tier: PlanTier.pro,
    name: "Pro",
    description: "Growing teams with RAG, agents, and automation.",
    monthlyPriceUsd: 79,
    annualPriceUsd: 790,
    trialDays: 14,
    popular: true,
  },
  {
    tier: PlanTier.team,
    name: "Team",
    description: "Collaborative teams with approvals and higher limits.",
    monthlyPriceUsd: 199,
    annualPriceUsd: 1990,
    trialDays: 14,
  },
  {
    tier: PlanTier.enterprise,
    name: "Enterprise",
    description: "Custom limits, SSO, and dedicated support.",
    monthlyPriceUsd: null,
    annualPriceUsd: null,
    trialDays: 30,
    contactSales: true,
  },
];

export const DEFAULT_PLAN_FEATURES: Record<PlanTier, PlanFeatures> = {
  [PlanTier.free]: {
    channels: ["gbp"],
    approvalWorkflows: false,
    knowledgeBaseRag: false,
    aiAgents: false,
    workflows: false,
    sso: false,
    maxStorageMb: 100,
    maxKnowledgeDocuments: 5,
    maxAgentRunsPerMonth: 0,
    maxWorkflowRunsPerMonth: 0,
  },
  [PlanTier.starter]: {
    channels: ["gbp"],
    approvalWorkflows: false,
    knowledgeBaseRag: true,
    aiAgents: false,
    workflows: true,
    sso: false,
    maxStorageMb: 500,
    maxKnowledgeDocuments: 25,
    maxAgentRunsPerMonth: 10,
    maxWorkflowRunsPerMonth: 50,
  },
  [PlanTier.pro]: {
    channels: ["gbp", "facebook", "instagram"],
    approvalWorkflows: false,
    knowledgeBaseRag: true,
    aiAgents: true,
    workflows: true,
    sso: false,
    maxStorageMb: 2048,
    maxKnowledgeDocuments: 100,
    maxAgentRunsPerMonth: 100,
    maxWorkflowRunsPerMonth: 500,
  },
  [PlanTier.team]: {
    channels: ["gbp", "facebook", "instagram"],
    approvalWorkflows: true,
    knowledgeBaseRag: true,
    aiAgents: true,
    workflows: true,
    sso: false,
    maxStorageMb: 10240,
    maxKnowledgeDocuments: 500,
    maxAgentRunsPerMonth: 500,
    maxWorkflowRunsPerMonth: 2000,
  },
  [PlanTier.enterprise]: {
    channels: ["gbp", "facebook", "instagram"],
    approvalWorkflows: true,
    knowledgeBaseRag: true,
    aiAgents: true,
    workflows: true,
    sso: true,
    maxStorageMb: 102400,
    maxKnowledgeDocuments: 10000,
    maxAgentRunsPerMonth: 10000,
    maxWorkflowRunsPerMonth: 50000,
  },
};

export const PLAN_TIER_ORDER: PlanTier[] = [
  PlanTier.free,
  PlanTier.starter,
  PlanTier.pro,
  PlanTier.team,
  PlanTier.enterprise,
];

export function comparePlanTiers(a: PlanTier, b: PlanTier): number {
  return PLAN_TIER_ORDER.indexOf(a) - PLAN_TIER_ORDER.indexOf(b);
}

export function getPlanDefinition(tier: PlanTier): PlanDefinition {
  return PLAN_CATALOG.find((p) => p.tier === tier) ?? PLAN_CATALOG[0];
}
