import { UsageMetricCategory } from "@limbu/db";
import { assertCreditsAvailable } from "../services/credit.service";
import { assertUsageQuota } from "../services/usage.service";
import { getOrganizationEntitlements } from "../services/entitlement.service";
import { BillingQuotaExceededError } from "../errors";

export async function assertMemberLimit(organizationId: string) {
  const entitlements = await getOrganizationEntitlements(organizationId);
  const { prisma } = await import("@limbu/db");
  const count = await prisma.organizationMember.count({
    where: { organizationId, status: "active" },
  });

  if (count >= entitlements.maxMembers) {
    throw new BillingQuotaExceededError(
      `Member limit reached (${entitlements.maxMembers} on your plan)`,
      "max_members",
    );
  }
}

export async function assertAiCredits(organizationId: string, amount: number) {
  await assertCreditsAvailable(organizationId, amount);
}

export async function assertAgentRunQuota(organizationId: string) {
  await assertUsageQuota(organizationId, UsageMetricCategory.agent_runs, 1);
}

export async function assertWorkflowRunQuota(organizationId: string) {
  await assertUsageQuota(organizationId, UsageMetricCategory.workflow_runs, 1);
}

export async function assertStorageQuota(organizationId: string, additionalBytes: number) {
  await assertUsageQuota(organizationId, UsageMetricCategory.storage_bytes, additionalBytes);
}

export async function assertKnowledgeDocumentQuota(organizationId: string) {
  await assertUsageQuota(
    organizationId,
    UsageMetricCategory.knowledge_base_documents,
    1,
  );
}
