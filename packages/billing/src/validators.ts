import { z } from "zod";
import { BillingInterval, PlanTier } from "@limbu/db";

export const checkoutSchema = z.object({
  plan: z.enum([
    PlanTier.starter,
    PlanTier.pro,
    PlanTier.team,
    PlanTier.enterprise,
  ]),
  interval: z.nativeEnum(BillingInterval).default(BillingInterval.monthly),
  couponCode: z.string().trim().max(64).optional(),
});

export const changePlanSchema = z.object({
  plan: z.enum([
    PlanTier.starter,
    PlanTier.pro,
    PlanTier.team,
    PlanTier.enterprise,
  ]),
  interval: z.nativeEnum(BillingInterval).optional(),
});

export const cancelSubscriptionSchema = z.object({
  cancelAtPeriodEnd: z.boolean().default(true),
});

export const updateEntitlementSchema = z.object({
  maxWorkspaces: z.number().int().min(1).max(99999).optional(),
  maxMembers: z.number().int().min(1).max(99999).optional(),
  monthlyCredits: z.number().int().min(0).max(1000000).optional(),
  maxPostsPerMonth: z.number().int().min(0).nullable().optional(),
  features: z
    .object({
      channels: z.array(z.string()).optional(),
      approvalWorkflows: z.boolean().optional(),
      knowledgeBaseRag: z.boolean().optional(),
      aiAgents: z.boolean().optional(),
      workflows: z.boolean().optional(),
      sso: z.boolean().optional(),
      maxStorageMb: z.number().int().min(0).optional(),
      maxKnowledgeDocuments: z.number().int().min(0).optional(),
      maxAgentRunsPerMonth: z.number().int().min(0).optional(),
      maxWorkflowRunsPerMonth: z.number().int().min(0).optional(),
    })
    .optional(),
});

export const trackUsageSchema = z.object({
  category: z.enum([
    "ai_tokens",
    "ai_credits",
    "storage_bytes",
    "knowledge_base_documents",
    "agent_runs",
    "workflow_runs",
  ]),
  quantity: z.number().int().positive(),
  referenceId: z.string().uuid().optional(),
});
