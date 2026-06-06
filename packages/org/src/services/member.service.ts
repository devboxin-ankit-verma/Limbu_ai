import { OrgRole, prisma } from "@limbu/db";
import { writeOrgAuditLog } from "../audit";
import { OrgForbiddenError, OrgNotFoundError, OrgValidationError } from "../errors";
import { requireOrganizationAccess } from "../access";
import { uiRoleToOrgRole, updateMemberRoleSchema } from "../validators";

export async function listOrganizationMembers(organizationId: string, userId: string) {
  await requireOrganizationAccess(organizationId, userId, OrgRole.member);

  const [active, suspended] = await Promise.all([
    prisma.organizationMember.findMany({
      where: { organizationId, status: "active" },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
      orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    }),
    prisma.organizationMember.findMany({
      where: { organizationId, status: "removed" },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return { active, suspended };
}

export async function updateMemberRole(
  organizationId: string,
  actorId: string,
  memberId: string,
  role: "admin" | "member" | "viewer",
) {
  const { role: actorRole } = await requireOrganizationAccess(organizationId, actorId, OrgRole.admin);

  const parsed = updateMemberRoleSchema.safeParse({ role });
  if (!parsed.success) {
    throw new OrgValidationError("Invalid role");
  }

  const member = await prisma.organizationMember.findFirst({
    where: { id: memberId, organizationId, status: "active" },
  });

  if (!member) throw new OrgNotFoundError("Member not found");
  if (member.role === OrgRole.owner) {
    throw new OrgForbiddenError("Cannot change the owner's role");
  }

  if (actorRole === OrgRole.admin && member.role === OrgRole.admin) {
    throw new OrgForbiddenError("Admins cannot modify other admins");
  }

  const newRole = uiRoleToOrgRole(parsed.data.role);

  const updated = await prisma.organizationMember.update({
    where: { id: memberId },
    data: { role: newRole },
    include: { user: { select: { id: true, email: true, name: true } } },
  });

  await writeOrgAuditLog({
    organizationId,
    actorId,
    action: "member.role_updated",
    resourceType: "organization_member",
    resourceId: memberId,
    metadata: { newRole, previousRole: member.role },
  });

  return updated;
}

export async function suspendMember(
  organizationId: string,
  actorId: string,
  memberId: string,
) {
  const { role: actorRole } = await requireOrganizationAccess(organizationId, actorId, OrgRole.admin);

  const member = await prisma.organizationMember.findFirst({
    where: { id: memberId, organizationId, status: "active" },
    include: { user: { select: { email: true } } },
  });

  if (!member) throw new OrgNotFoundError("Member not found");
  if (member.role === OrgRole.owner) {
    throw new OrgForbiddenError("Cannot suspend the organization owner");
  }
  if (member.userId === actorId) {
    throw new OrgForbiddenError("You cannot suspend yourself");
  }
  if (actorRole === OrgRole.admin && member.role === OrgRole.admin) {
    throw new OrgForbiddenError("Admins cannot suspend other admins");
  }

  await prisma.organizationMember.update({
    where: { id: memberId },
    data: { status: "removed" },
  });

  await writeOrgAuditLog({
    organizationId,
    actorId,
    action: "member.suspended",
    resourceType: "organization_member",
    resourceId: memberId,
    metadata: { email: member.user.email },
  });
}

export async function reactivateMember(
  organizationId: string,
  actorId: string,
  memberId: string,
) {
  await requireOrganizationAccess(organizationId, actorId, OrgRole.admin);

  const member = await prisma.organizationMember.findFirst({
    where: { id: memberId, organizationId, status: "removed" },
  });

  if (!member) throw new OrgNotFoundError("Suspended member not found");

  await prisma.organizationMember.update({
    where: { id: memberId },
    data: { status: "active" },
  });

  await writeOrgAuditLog({
    organizationId,
    actorId,
    action: "member.reactivated",
    resourceType: "organization_member",
    resourceId: memberId,
  });
}

export async function removeMember(
  organizationId: string,
  actorId: string,
  memberId: string,
) {
  const { role: actorRole } = await requireOrganizationAccess(organizationId, actorId, OrgRole.admin);

  const member = await prisma.organizationMember.findFirst({
    where: { id: memberId, organizationId },
    include: { user: { select: { email: true } } },
  });

  if (!member) throw new OrgNotFoundError("Member not found");
  if (member.role === OrgRole.owner) {
    throw new OrgForbiddenError("Cannot remove the organization owner");
  }
  if (member.userId === actorId) {
    throw new OrgForbiddenError("You cannot remove yourself");
  }
  if (actorRole === OrgRole.admin && member.role === OrgRole.admin) {
    throw new OrgForbiddenError("Admins cannot remove other admins");
  }

  await prisma.$transaction([
    prisma.organizationMember.delete({ where: { id: memberId } }),
    prisma.workspaceMember.deleteMany({
      where: {
        userId: member.userId,
        workspace: { organizationId },
      },
    }),
  ]);

  await writeOrgAuditLog({
    organizationId,
    actorId,
    action: "member.removed",
    resourceType: "organization_member",
    resourceId: memberId,
    metadata: { email: member.user.email },
  });
}
