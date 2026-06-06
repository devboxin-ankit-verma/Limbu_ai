import { OrgStatus, PlanTier, prisma } from "@limbu/db";
import type { AdminOrgSummary, Paginated } from "../types";
import { AdminNotFoundError } from "../errors";
import { writeAdminAuditLog } from "../audit";
import { adminSetPlan } from "@limbu/billing";

export async function listOrganizations(input: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<Paginated<AdminOrgSummary>> {
  const page = input.page ?? 1;
  const limit = input.limit ?? 20;
  const skip = (page - 1) * limit;

  const where = {
    deletedAt: null,
    ...(input.search
      ? {
          OR: [
            { name: { contains: input.search, mode: "insensitive" as const } },
            { slug: { contains: input.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.organization.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        planTier: true,
        status: true,
        createdAt: true,
        owner: { select: { email: true } },
        _count: { select: { members: true, workspaces: true } },
      },
    }),
    prisma.organization.count({ where }),
  ]);

  return {
    items: rows.map((o) => ({
      id: o.id,
      name: o.name,
      slug: o.slug,
      planTier: o.planTier,
      status: o.status,
      memberCount: o._count.members,
      workspaceCount: o._count.workspaces,
      ownerEmail: o.owner.email,
      createdAt: o.createdAt.toISOString(),
    })),
    total,
    page,
    limit,
  };
}

export async function getOrganization(organizationId: string) {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      owner: { select: { id: true, email: true, name: true } },
      creditBalance: { select: { balance: true } },
      subscriptions: {
        where: { isCurrent: true },
        take: 1,
      },
      _count: { select: { members: true, workspaces: true } },
    },
  });
  if (!org || org.deletedAt) throw new AdminNotFoundError("Organization not found");
  return org;
}

export async function updateOrganization(
  organizationId: string,
  input: { status?: OrgStatus; planTier?: PlanTier; name?: string },
  actorId: string,
) {
  const org = await prisma.organization.findUnique({ where: { id: organizationId } });
  if (!org || org.deletedAt) throw new AdminNotFoundError("Organization not found");

  if (input.planTier && input.planTier !== org.planTier) {
    await adminSetPlan({ organizationId, plan: input.planTier, actorId });
  }

  const updated = await prisma.organization.update({
    where: { id: organizationId },
    data: {
      ...(input.status ? { status: input.status } : {}),
      ...(input.name ? { name: input.name.trim() } : {}),
    },
    select: { id: true, name: true, status: true, planTier: true },
  });

  await writeAdminAuditLog({
    organizationId,
    actorId,
    action: "admin.organization.updated",
    resourceType: "organization",
    resourceId: organizationId,
    metadata: input as Record<string, unknown>,
  });

  return updated;
}

export async function suspendOrganization(organizationId: string, actorId: string) {
  return updateOrganization(organizationId, { status: OrgStatus.suspended }, actorId);
}
