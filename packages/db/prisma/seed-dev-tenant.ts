import {
  AuthProvider,
  OrgRole,
  OrgStatus,
  PrismaClient,
  WorkspaceRole,
  WorkspaceStatus,
} from "@prisma/client";

export const DEV_USER_ID = "00000000-0000-4000-8000-000000000099";
export const DEV_ORG_ID = "00000000-0000-4000-8000-000000000001";
export const DEV_WORKSPACE_ID = "00000000-0000-4000-8000-000000000002";

/** Idempotent dev tenant for DEV_SKIP_AUTH local UI (chat, workflows, etc.). */
export async function seedDevTenant(prisma: PrismaClient) {
  await prisma.user.upsert({
    where: { id: DEV_USER_ID },
    create: {
      id: DEV_USER_ID,
      email: "dev@limbu.local",
      name: "Dev User",
      authProvider: AuthProvider.email,
      emailVerified: new Date(),
      isSuperAdmin: true,
    },
    update: {
      email: "dev@limbu.local",
      name: "Dev User",
      emailVerified: new Date(),
      isSuperAdmin: true,
      deletedAt: null,
    },
  });

  await prisma.organization.upsert({
    where: { id: DEV_ORG_ID },
    create: {
      id: DEV_ORG_ID,
      name: "Dev Organization",
      slug: "dev-org",
      ownerId: DEV_USER_ID,
      status: OrgStatus.active,
    },
    update: {
      name: "Dev Organization",
      slug: "dev-org",
      ownerId: DEV_USER_ID,
      status: OrgStatus.active,
      deletedAt: null,
    },
  });

  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: DEV_ORG_ID,
        userId: DEV_USER_ID,
      },
    },
    create: {
      organizationId: DEV_ORG_ID,
      userId: DEV_USER_ID,
      role: OrgRole.owner,
    },
    update: { role: OrgRole.owner, status: "active" },
  });

  await prisma.workspace.upsert({
    where: { id: DEV_WORKSPACE_ID },
    create: {
      id: DEV_WORKSPACE_ID,
      organizationId: DEV_ORG_ID,
      name: "Dev Workspace",
      status: WorkspaceStatus.active,
    },
    update: {
      name: "Dev Workspace",
      organizationId: DEV_ORG_ID,
      status: WorkspaceStatus.active,
      deletedAt: null,
    },
  });

  await prisma.workspaceMember.upsert({
    where: {
      workspaceId_userId: {
        workspaceId: DEV_WORKSPACE_ID,
        userId: DEV_USER_ID,
      },
    },
    create: {
      workspaceId: DEV_WORKSPACE_ID,
      userId: DEV_USER_ID,
      role: WorkspaceRole.admin,
    },
    update: { role: WorkspaceRole.admin, status: "active" },
  });
}
