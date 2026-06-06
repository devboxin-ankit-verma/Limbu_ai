import { prisma } from "@limbu/db";
import { PlanTier } from "@limbu/db";
import type { AdminSubscriptionRow, Paginated } from "../types";
import { adminSetPlan } from "@limbu/billing";
import { writeAdminAuditLog } from "../audit";
import { AdminNotFoundError } from "../errors";

export async function listSubscriptions(input: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<Paginated<AdminSubscriptionRow>> {
  const page = input.page ?? 1;
  const limit = input.limit ?? 20;
  const skip = (page - 1) * limit;

  const where = {
    isCurrent: true,
    ...(input.search
      ? {
          organization: {
            name: { contains: input.search, mode: "insensitive" as const },
          },
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.subscription.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        organizationId: true,
        plan: true,
        billingInterval: true,
        status: true,
        currentPeriodEnd: true,
        cancelAtPeriodEnd: true,
        organization: { select: { name: true } },
      },
    }),
    prisma.subscription.count({ where }),
  ]);

  return {
    items: rows.map((s) => ({
      id: s.id,
      organizationId: s.organizationId,
      organizationName: s.organization.name,
      plan: s.plan,
      billingInterval: s.billingInterval,
      status: s.status,
      currentPeriodEnd: s.currentPeriodEnd?.toISOString() ?? null,
      cancelAtPeriodEnd: s.cancelAtPeriodEnd,
    })),
    total,
    page,
    limit,
  };
}

export async function adminUpdateSubscriptionPlan(input: {
  organizationId: string;
  plan: PlanTier;
  actorId: string;
}) {
  const org = await prisma.organization.findUnique({
    where: { id: input.organizationId },
    select: { id: true, deletedAt: true },
  });
  if (!org || org.deletedAt) throw new AdminNotFoundError("Organization not found");

  await adminSetPlan({
    organizationId: input.organizationId,
    plan: input.plan,
    actorId: input.actorId,
  });

  await writeAdminAuditLog({
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "admin.subscription.plan_updated",
    resourceType: "subscription",
    metadata: { plan: input.plan },
  });

  return { organizationId: input.organizationId, plan: input.plan };
}
