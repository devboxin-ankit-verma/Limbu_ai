import { assertOrgAccess } from "@limbu/auth";
import { hasOrgRole } from "@limbu/auth/rbac";
import { prisma, type OrgRole } from "@limbu/db";
import { OrgForbiddenError, OrgNotFoundError } from "./errors";

export async function getOrganizationForUser(
  organizationId: string,
  userId: string,
) {
  return prisma.organization.findFirst({
    where: {
      id: organizationId,
      deletedAt: null,
      members: { some: { userId, status: "active" } },
    },
    include: {
      owner: { select: { id: true, name: true, email: true, avatarUrl: true } },
      _count: { select: { members: true, workspaces: true } },
    },
  });
}

export async function requireOrganizationAccess(
  organizationId: string,
  userId: string,
  minimumRole?: OrgRole,
) {
  const org = await getOrganizationForUser(organizationId, userId);
  if (!org) throw new OrgNotFoundError();

  const role = await assertOrgAccess(userId, organizationId);

  if (minimumRole && !hasOrgRole(role, minimumRole)) {
    throw new OrgForbiddenError();
  }

  return { org, role };
}

export async function listUserOrganizations(userId: string) {
  const memberships = await prisma.organizationMember.findMany({
    where: { userId, status: "active", organization: { deletedAt: null } },
    include: {
      organization: {
        include: {
          owner: { select: { id: true, name: true, email: true } },
          _count: { select: { members: true, workspaces: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return memberships.map((m) => ({
    ...m.organization,
    membershipRole: m.role,
    membershipId: m.id,
  }));
}
