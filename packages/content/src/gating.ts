import { prisma } from "@limbu/db";
import { getOrganizationEntitlements } from "@limbu/billing";
import { ContentError } from "./errors";

export async function assertPostQuota(organizationId: string) {
  const entitlements = await getOrganizationEntitlements(organizationId);
  if (entitlements.maxPostsPerMonth === null) return;

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { id: true },
  });
  if (!org) return;

  const count = await prisma.post.count({
    where: {
      organizationId,
      createdAt: { gte: startOfMonth },
      deletedAt: null,
    },
  });

  if (count >= entitlements.maxPostsPerMonth) {
    throw new ContentError(
      `Monthly post limit reached (${entitlements.maxPostsPerMonth}). Upgrade your plan.`,
      "QUOTA_EXCEEDED",
      402,
    );
  }
}
