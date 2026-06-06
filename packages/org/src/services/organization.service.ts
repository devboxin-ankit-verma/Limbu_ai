import { OrgRole, OrgStatus, prisma, WorkspaceRole } from "@limbu/db";
import { writeOrgAuditLog } from "../audit";
import {
  OrgForbiddenError,
  OrgNotFoundError,
  OrgValidationError,
} from "../errors";
import { generateUniqueSlug } from "../slug";
import {
  createOrganizationSchema,
  updateOrganizationSchema,
} from "../validators";
import { getOrganizationForUser, requireOrganizationAccess } from "../access";

async function slugExists(slug: string, excludeId?: string): Promise<boolean> {
  const existing = await prisma.organization.findFirst({
    where: { slug, deletedAt: null, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
    select: { id: true },
  });
  return !!existing;
}

export async function createOrganization(
  userId: string,
  input: { name: string; slug?: string },
) {
  const parsed = createOrganizationSchema.safeParse(input);
  if (!parsed.success) {
    throw new OrgValidationError("Invalid input", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }

  const slug =
    parsed.data.slug ??
    (await generateUniqueSlug(parsed.data.name, (s) => slugExists(s)));

  if (parsed.data.slug && (await slugExists(parsed.data.slug))) {
    throw new OrgValidationError("Slug is already taken", { slug: ["Slug is already taken"] });
  }

  const org = await prisma.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: {
        name: parsed.data.name.trim(),
        slug,
        ownerId: userId,
        status: OrgStatus.active,
      },
    });

    await tx.organizationMember.create({
      data: {
        organizationId: organization.id,
        userId,
        role: OrgRole.owner,
        status: "active",
      },
    });

    const workspace = await tx.workspace.create({
      data: {
        organizationId: organization.id,
        name: "Main",
        timezone: "UTC",
        settings: { isDefault: true },
      },
    });

    await tx.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId,
        role: WorkspaceRole.admin,
        status: "active",
      },
    });

    return organization;
  });

  const { initializeCreditBalance } = await import("@limbu/billing");
  await initializeCreditBalance(org.id);

  await writeOrgAuditLog({
    organizationId: org.id,
    actorId: userId,
    action: "organization.created",
    resourceType: "organization",
    resourceId: org.id,
    metadata: { name: org.name, slug: org.slug },
  });

  return org;
}

export async function updateOrganization(
  organizationId: string,
  userId: string,
  input: { name?: string; slug?: string },
) {
  const { org, role } = await requireOrganizationAccess(organizationId, userId, OrgRole.admin);

  const parsed = updateOrganizationSchema.safeParse(input);
  if (!parsed.success) {
    throw new OrgValidationError("Invalid input", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }

  if (parsed.data.slug && parsed.data.slug !== org.slug) {
    if (await slugExists(parsed.data.slug, organizationId)) {
      throw new OrgValidationError("Slug is already taken", { slug: ["Slug is already taken"] });
    }
  }

  const updated = await prisma.organization.update({
    where: { id: organizationId },
    data: {
      ...(parsed.data.name ? { name: parsed.data.name.trim() } : {}),
      ...(parsed.data.slug ? { slug: parsed.data.slug } : {}),
    },
  });

  await writeOrgAuditLog({
    organizationId,
    actorId: userId,
    action: "organization.updated",
    resourceType: "organization",
    resourceId: organizationId,
    metadata: parsed.data,
  });

  return updated;
}

export async function deleteOrganization(organizationId: string, userId: string) {
  const { org, role } = await requireOrganizationAccess(organizationId, userId);

  if (role !== OrgRole.owner) {
    throw new OrgForbiddenError("Only the organization owner can delete the organization");
  }

  await prisma.organization.update({
    where: { id: organizationId },
    data: {
      deletedAt: new Date(),
      status: OrgStatus.cancelled,
    },
  });

  await writeOrgAuditLog({
    organizationId,
    actorId: userId,
    action: "organization.deleted",
    resourceType: "organization",
    resourceId: organizationId,
  });
}

export async function transferOwnership(
  organizationId: string,
  userId: string,
  newOwnerMemberId: string,
) {
  const { role } = await requireOrganizationAccess(organizationId, userId);

  if (role !== OrgRole.owner) {
    throw new OrgForbiddenError("Only the owner can transfer ownership");
  }

  const targetMember = await prisma.organizationMember.findFirst({
    where: {
      id: newOwnerMemberId,
      organizationId,
      status: "active",
      role: { in: [OrgRole.admin, OrgRole.member] },
    },
    include: { user: { select: { id: true, email: true } } },
  });

  if (!targetMember) {
    throw new OrgNotFoundError("Target member not found or not eligible");
  }

  await prisma.$transaction([
    prisma.organization.update({
      where: { id: organizationId },
      data: { ownerId: targetMember.userId },
    }),
    prisma.organizationMember.update({
      where: { id: newOwnerMemberId },
      data: { role: OrgRole.owner },
    }),
    prisma.organizationMember.update({
      where: { organizationId_userId: { organizationId, userId } },
      data: { role: OrgRole.admin },
    }),
  ]);

  await writeOrgAuditLog({
    organizationId,
    actorId: userId,
    action: "organization.ownership_transferred",
    resourceType: "organization_member",
    resourceId: newOwnerMemberId,
    metadata: { newOwnerId: targetMember.userId, newOwnerEmail: targetMember.user.email },
  });

  return { newOwnerId: targetMember.userId };
}

export async function getOrganizationProfile(organizationId: string, userId: string) {
  const org = await getOrganizationForUser(organizationId, userId);
  if (!org) throw new OrgNotFoundError();
  return org;
}

export { getOrganizationForUser, requireOrganizationAccess };
