import { assertWorkspaceAccess } from "@limbu/auth";
import { hasOrgRole, hasWorkspaceRole } from "@limbu/auth/rbac";
import { OrgRole, prisma, type WorkspaceRole } from "@limbu/db";
import { requireOrganizationAccess } from "@limbu/org";
import { WorkspaceForbiddenError, WorkspaceNotFoundError } from "./errors";

export async function getWorkspaceForUser(workspaceId: string, userId: string) {
  return prisma.workspace.findFirst({
    where: {
      id: workspaceId,
      deletedAt: null,
      OR: [
        { members: { some: { userId, status: "active" } } },
        {
          organization: {
            members: {
              some: {
                userId,
                status: "active",
                role: { in: [OrgRole.owner, OrgRole.admin] },
              },
            },
          },
        },
      ],
    },
    include: {
      _count: { select: { members: true } },
      organization: { select: { id: true, name: true, planTier: true } },
    },
  });
}

export async function requireWorkspaceAccess(
  workspaceId: string,
  userId: string,
  minimumWsRole?: WorkspaceRole,
) {
  const workspace = await getWorkspaceForUser(workspaceId, userId);
  if (!workspace) throw new WorkspaceNotFoundError();

  try {
    const ctx = await assertWorkspaceAccess(userId, workspaceId);
    if (minimumWsRole && !hasWorkspaceRole(ctx.workspaceRole, minimumWsRole)) {
      if (!hasOrgRole(ctx.orgRole, OrgRole.admin)) {
        throw new WorkspaceForbiddenError();
      }
    }
    return { workspace, ...ctx };
  } catch {
    const { role: orgRole } = await requireOrganizationAccess(
      workspace.organizationId,
      userId,
      OrgRole.admin,
    );
    return {
      workspace,
      organizationId: workspace.organizationId,
      workspaceRole: null as WorkspaceRole | null,
      orgRole,
    };
  }
}

export async function listWorkspacesForUser(organizationId: string, userId: string) {
  const { role: orgRole } = await requireOrganizationAccess(organizationId, userId);

  const isOrgAdmin = hasOrgRole(orgRole, OrgRole.admin);

  const workspaces = await prisma.workspace.findMany({
    where: {
      organizationId,
      deletedAt: null,
      ...(isOrgAdmin
        ? {}
        : { members: { some: { userId, status: "active" } } }),
    },
    include: {
      _count: { select: { members: true } },
      members: {
        where: { userId, status: "active" },
        select: { role: true },
        take: 1,
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return workspaces.map((ws) => ({
    ...ws,
    membershipRole: ws.members[0]?.role ?? null,
    members: undefined,
  }));
}
