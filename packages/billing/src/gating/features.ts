import { prisma } from "@limbu/db";
import type { PlanFeatures } from "../types";
import { getOrganizationEntitlements } from "../services/entitlement.service";

export type FeatureKey =
  | "knowledge_base_rag"
  | "ai_agents"
  | "workflows"
  | "approval_workflows"
  | "sso"
  | "agency_mode"
  | "gmb_publishing"
  | "review_auto_reply"
  | "magic_qr";

const PLAN_FEATURE_CHECKS: Record<FeatureKey, (features: PlanFeatures) => boolean> = {
  knowledge_base_rag: (f) => f.knowledgeBaseRag,
  ai_agents: (f) => f.aiAgents,
  workflows: (f) => f.workflows,
  approval_workflows: (f) => f.approvalWorkflows,
  sso: (f) => f.sso,
  agency_mode: (f) => f.workflows && f.knowledgeBaseRag,
  gmb_publishing: (f) => f.gmbPublishing ?? false,
  review_auto_reply: (f) => f.reviewAutoReply ?? false,
  magic_qr: (f) => f.magicQr ?? false,
};

export async function hasFeature(
  organizationId: string,
  feature: FeatureKey,
): Promise<boolean> {
  const override = await prisma.orgFeatureOverride.findUnique({
    where: {
      organizationId_flagKey: {
        organizationId,
        flagKey: feature,
      },
    },
  });

  if (override) {
    return override.value;
  }

  const flag = await prisma.featureFlag.findUnique({
    where: { key: feature },
  });

  const entitlements = await getOrganizationEntitlements(organizationId);
  const planHasFeature = PLAN_FEATURE_CHECKS[feature]?.(entitlements.features) ?? false;

  if (feature === "agency_mode") {
    return planHasFeature && entitlements.maxWorkspaces > 3;
  }

  if (flag) {
    return flag.defaultValue && planHasFeature;
  }

  return planHasFeature;
}

export async function assertFeature(organizationId: string, feature: FeatureKey) {
  const allowed = await hasFeature(organizationId, feature);
  if (!allowed) {
    const { BillingQuotaExceededError } = await import("../errors");
    throw new BillingQuotaExceededError(
      `Feature "${feature}" is not available on your plan`,
      feature,
    );
  }
}
