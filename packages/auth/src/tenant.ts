import { prisma, type OrgRole, type WorkspaceRole } from "@limbu/db";
import type { TenantSession } from "./types";

export async function loadUserPlatformFlags(userId: string): Promise<{ isSuperAdmin: boolean }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isSuperAdmin: true },
  });
  return { isSuperAdmin: user?.isSuperAdmin ?? false };
}

export async function assertSuperAdmin(userId: string): Promise<void> {
  const { isSuperAdmin } = await loadUserPlatformFlags(userId);
  if (!isSuperAdmin) throw new Error("PLATFORM_ACCESS_DENIED");
}

export async function isSuperAdmin(userId: string): Promise<boolean> {
  const flags = await loadUserPlatformFlags(userId);
  return flags.isSuperAdmin;
}

export async function loadTenantContext(userId: string): Promise<TenantSession> {
  const [platform, orgMember] = await Promise.all([
    loadUserPlatformFlags(userId),
    prisma.organizationMember.findFirst({
      where: { userId, status: "active" },
      orderBy: { createdAt: "asc" },
      select: { organizationId: true, role: true },
    }),
  ]);

  if (!orgMember) {
    return {
      organizationId: null,
      orgRole: null,
      workspaceId: null,
      workspaceRole: null,
      isSuperAdmin: platform.isSuperAdmin,
    };
  }

  const wsMember = await prisma.workspaceMember.findFirst({
    where: {
      userId,
      status: "active",
      workspace: {
        organizationId: orgMember.organizationId,
        status: "active",
        deletedAt: null,
      },
    },
    orderBy: { createdAt: "asc" },
    select: { workspaceId: true, role: true },
  });

  return {
    organizationId: orgMember.organizationId,
    orgRole: orgMember.role,
    workspaceId: wsMember?.workspaceId ?? null,
    workspaceRole: wsMember?.role ?? null,
    isSuperAdmin: platform.isSuperAdmin,
  };
}

export async function assertOrgAccess(
  userId: string,
  organizationId: string,
): Promise<OrgRole> {
  const member = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: { organizationId, userId },
    },
    select: { role: true, status: true },
  });

  if (!member || member.status !== "active") {
    throw new Error("ORG_ACCESS_DENIED");
  }

  return member.role;
}

export async function assertWorkspaceAccess(
  userId: string,
  workspaceId: string,
): Promise<{ organizationId: string; workspaceRole: WorkspaceRole; orgRole: OrgRole }> {
  const wsMember = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: { workspaceId, userId },
    },
    select: {
      role: true,
      status: true,
      workspace: { select: { organizationId: true, deletedAt: true, status: true } },
    },
  });

  if (
    !wsMember ||
    wsMember.status !== "active" ||
    wsMember.workspace.deletedAt ||
    wsMember.workspace.status !== "active"
  ) {
    throw new Error("WORKSPACE_ACCESS_DENIED");
  }

  const orgRole = await assertOrgAccess(userId, wsMember.workspace.organizationId);

  return {
    organizationId: wsMember.workspace.organizationId,
    workspaceRole: wsMember.role,
    orgRole,
  };
}

export async function resolveOrgRoleForUser(
  userId: string,
  organizationId: string,
): Promise<OrgRole | null> {
  try {
    return await assertOrgAccess(userId, organizationId);
  } catch {
    return null;
  }
}

export async function resolveWorkspaceRoleForUser(
  userId: string,
  workspaceId: string,
): Promise<{ organizationId: string; orgRole: OrgRole; workspaceRole: WorkspaceRole | null } | null> {
  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, deletedAt: null },
    select: { organizationId: true },
  });
  if (!workspace) return null;

  try {
    const orgRole = await assertOrgAccess(userId, workspace.organizationId);
    try {
      const ws = await assertWorkspaceAccess(userId, workspaceId);
      return {
        organizationId: ws.organizationId,
        orgRole: ws.orgRole,
        workspaceRole: ws.workspaceRole,
      };
    } catch {
      return {
        organizationId: workspace.organizationId,
        orgRole,
        workspaceRole: null,
      };
    }
  } catch {
    return null;
  }
}
