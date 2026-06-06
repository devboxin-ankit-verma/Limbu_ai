import { PlanTier, prisma } from "@limbu/db";
import type { PlanFeatures } from "../types";
import { DEFAULT_PLAN_FEATURES } from "../plans/catalog";

export type OrganizationEntitlements = {
  planTier: PlanTier;
  maxWorkspaces: number;
  maxMembers: number;
  monthlyCredits: number;
  maxPostsPerMonth: number | null;
  features: PlanFeatures;
};

function parseFeatures(raw: unknown, tier: PlanTier): PlanFeatures {
  const defaults = DEFAULT_PLAN_FEATURES[tier];
  if (!raw || typeof raw !== "object") return defaults;
  return { ...defaults, ...(raw as Partial<PlanFeatures>) };
}

export async function getOrganizationEntitlements(
  organizationId: string,
): Promise<OrganizationEntitlements> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { planTier: true },
  });

  const tier = org?.planTier ?? PlanTier.free;
  const entitlement = await prisma.planEntitlement.findUnique({
    where: { planTier: tier },
  });

  if (!entitlement) {
    return {
      planTier: tier,
      maxWorkspaces: 1,
      maxMembers: 1,
      monthlyCredits: 50,
      maxPostsPerMonth: 10,
      features: DEFAULT_PLAN_FEATURES[tier],
    };
  }

  return {
    planTier: tier,
    maxWorkspaces: entitlement.maxWorkspaces,
    maxMembers: entitlement.maxMembers,
    monthlyCredits: entitlement.monthlyCredits,
    maxPostsPerMonth: entitlement.maxPostsPerMonth,
    features: parseFeatures(entitlement.features, tier),
  };
}

export async function listPlanEntitlements() {
  const rows = await prisma.planEntitlement.findMany({
    orderBy: { planTier: "asc" },
  });

  return rows.map((row) => ({
    planTier: row.planTier,
    maxWorkspaces: row.maxWorkspaces,
    maxMembers: row.maxMembers,
    monthlyCredits: row.monthlyCredits,
    maxPostsPerMonth: row.maxPostsPerMonth,
    features: parseFeatures(row.features, row.planTier),
  }));
}

export async function updatePlanEntitlement(
  planTier: PlanTier,
  input: {
    maxWorkspaces?: number;
    maxMembers?: number;
    monthlyCredits?: number;
    maxPostsPerMonth?: number | null;
    features?: Partial<PlanFeatures>;
  },
  actorId: string,
  auditOrganizationId: string,
) {
  const existing = await prisma.planEntitlement.findUnique({
    where: { planTier },
  });

  const currentFeatures = parseFeatures(existing?.features, planTier);
  const mergedFeatures = input.features
    ? { ...currentFeatures, ...input.features }
    : currentFeatures;

  const updated = await prisma.planEntitlement.upsert({
    where: { planTier },
    create: {
      planTier,
      maxWorkspaces: input.maxWorkspaces ?? 1,
      maxMembers: input.maxMembers ?? 1,
      monthlyCredits: input.monthlyCredits ?? 50,
      maxPostsPerMonth: input.maxPostsPerMonth ?? null,
      features: mergedFeatures,
    },
    update: {
      ...(input.maxWorkspaces !== undefined ? { maxWorkspaces: input.maxWorkspaces } : {}),
      ...(input.maxMembers !== undefined ? { maxMembers: input.maxMembers } : {}),
      ...(input.monthlyCredits !== undefined ? { monthlyCredits: input.monthlyCredits } : {}),
      ...(input.maxPostsPerMonth !== undefined
        ? { maxPostsPerMonth: input.maxPostsPerMonth }
        : {}),
      ...(input.features ? { features: mergedFeatures } : {}),
    },
  });

  const { writeBillingAuditLog } = await import("../audit");
  await writeBillingAuditLog({
    organizationId: auditOrganizationId,
    actorId,
    action: "billing.entitlement.updated",
    resourceType: "plan_entitlement",
    resourceId: planTier,
    metadata: input as Record<string, unknown>,
  });

  return {
    planTier: updated.planTier,
    maxWorkspaces: updated.maxWorkspaces,
    maxMembers: updated.maxMembers,
    monthlyCredits: updated.monthlyCredits,
    maxPostsPerMonth: updated.maxPostsPerMonth,
    features: parseFeatures(updated.features, updated.planTier),
  };
}
