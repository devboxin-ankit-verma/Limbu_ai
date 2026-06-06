import { generateSecureToken } from "@limbu/auth";
import { OrgRole, prisma } from "@limbu/db";
import { writeOrgAuditLog } from "../audit";
import { sendInvitationEmail } from "../email";
import { OrgForbiddenError, OrgNotFoundError, OrgValidationError } from "../errors";
import { requireOrganizationAccess } from "../access";
import { inviteMemberSchema, uiRoleToOrgRole } from "../validators";

const INVITE_DAYS = 7;

export async function inviteMember(
  organizationId: string,
  inviterId: string,
  input: { email: string; role: "admin" | "member" | "viewer" },
) {
  const { org, role: inviterRole } = await requireOrganizationAccess(
    organizationId,
    inviterId,
    OrgRole.admin,
  );

  const parsed = inviteMemberSchema.safeParse(input);
  if (!parsed.success) {
    throw new OrgValidationError("Invalid input", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }

  if (inviterRole === OrgRole.admin && parsed.data.role === "admin") {
    throw new OrgForbiddenError("Admins cannot invite other admins");
  }

  const email = parsed.data.email.toLowerCase().trim();

  const existingMember = await prisma.organizationMember.findFirst({
    where: {
      organizationId,
      status: "active",
      user: { email, deletedAt: null },
    },
  });

  if (existingMember) {
    throw new OrgValidationError("This user is already a member", {
      email: ["Already a member of this organization"],
    });
  }

  const { assertMemberLimit } = await import("@limbu/billing");
  await assertMemberLimit(organizationId);

  const pendingInvite = await prisma.invitation.findFirst({
    where: { organizationId, email, status: "pending", expiresAt: { gt: new Date() } },
  });

  if (pendingInvite) {
    throw new OrgValidationError("A pending invitation already exists for this email", {
      email: ["Invitation already sent"],
    });
  }

  const token = generateSecureToken(32);
  const orgRole = uiRoleToOrgRole(parsed.data.role);

  const invitation = await prisma.invitation.create({
    data: {
      organizationId,
      email,
      orgRole,
      token,
      expiresAt: new Date(Date.now() + INVITE_DAYS * 24 * 60 * 60 * 1000),
    },
  });

  const inviter = await prisma.user.findUnique({
    where: { id: inviterId },
    select: { name: true, email: true },
  });

  await sendInvitationEmail({
    userId: inviterId,
    to: email,
    organizationName: org.name,
    inviterName: inviter?.name ?? inviter?.email ?? "A team member",
    token,
    role: parsed.data.role,
  });

  await writeOrgAuditLog({
    organizationId,
    actorId: inviterId,
    action: "invitation.sent",
    resourceType: "invitation",
    resourceId: invitation.id,
    metadata: { email, role: parsed.data.role },
  });

  return invitation;
}

export async function listInvitations(organizationId: string, userId: string) {
  await requireOrganizationAccess(organizationId, userId, OrgRole.admin);

  return prisma.invitation.findMany({
    where: {
      organizationId,
      status: "pending",
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function revokeInvitation(
  organizationId: string,
  userId: string,
  invitationId: string,
) {
  await requireOrganizationAccess(organizationId, userId, OrgRole.admin);

  const invitation = await prisma.invitation.findFirst({
    where: { id: invitationId, organizationId, status: "pending" },
  });

  if (!invitation) throw new OrgNotFoundError("Invitation not found");

  await prisma.invitation.update({
    where: { id: invitationId },
    data: { status: "revoked" },
  });

  await writeOrgAuditLog({
    organizationId,
    actorId: userId,
    action: "invitation.revoked",
    resourceType: "invitation",
    resourceId: invitationId,
  });
}

export async function getInvitationByToken(token: string) {
  const invitation = await prisma.invitation.findFirst({
    where: { token, status: "pending", expiresAt: { gt: new Date() } },
    include: {
      organization: { select: { id: true, name: true, slug: true, deletedAt: true } },
    },
  });

  if (!invitation || invitation.organization.deletedAt) {
    return null;
  }

  return invitation;
}

export async function acceptInvitation(token: string, userId: string, userEmail: string) {
  const invitation = await getInvitationByToken(token);

  if (!invitation) {
    throw new OrgNotFoundError("Invitation not found or expired");
  }

  if (invitation.email.toLowerCase() !== userEmail.toLowerCase()) {
    throw new OrgForbiddenError("This invitation was sent to a different email address");
  }

  const existing = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: invitation.organizationId,
        userId,
      },
    },
  });

  if (existing?.status === "active") {
    throw new OrgValidationError("You are already a member of this organization");
  }

  await prisma.$transaction(async (tx) => {
    if (existing) {
      await tx.organizationMember.update({
        where: { id: existing.id },
        data: { role: invitation.orgRole, status: "active" },
      });
    } else {
      await tx.organizationMember.create({
        data: {
          organizationId: invitation.organizationId,
          userId,
          role: invitation.orgRole,
          status: "active",
        },
      });
    }

    await tx.invitation.update({
      where: { id: invitation.id },
      data: { status: "accepted", acceptedAt: new Date() },
    });
  });

  await writeOrgAuditLog({
    organizationId: invitation.organizationId,
    actorId: userId,
    action: "invitation.accepted",
    resourceType: "invitation",
    resourceId: invitation.id,
  });

  return {
    organizationId: invitation.organizationId,
    organizationName: invitation.organization.name,
    role: invitation.orgRole,
  };
}
