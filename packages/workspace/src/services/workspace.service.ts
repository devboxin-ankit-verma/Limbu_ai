import { hasOrgRole } from "@limbu/auth/rbac";
import { OrgRole, prisma, WorkspaceRole, WorkspaceStatus, type Prisma } from "@limbu/db";
import { requireOrganizationAccess } from "@limbu/org";
import { writeWorkspaceAuditLog } from "../audit";
import {
  WorkspaceForbiddenError,
  WorkspaceNotFoundError,
  WorkspaceValidationError,
} from "../errors";
import { parseWorkspaceSettings, type WorkspaceSettings } from "../types";
import { createWorkspaceSchema, updateWorkspaceSchema } from "../validators";
import { getWorkspaceForUser, listWorkspacesForUser, requireWorkspaceAccess } from "../access";

async function assertWorkspaceLimit(organizationId: string) {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { planTier: true },
  });
  if (!org) throw new WorkspaceNotFoundError();

  const entitlement = await prisma.planEntitlement.findUnique({
    where: { planTier: org.planTier },
    select: { maxWorkspaces: true },
  });

  const count = await prisma.workspace.count({
    where: { organizationId, deletedAt: null },
  });

  const max = entitlement?.maxWorkspaces ?? 1;
  if (count >= max) {
    throw new WorkspaceValidationError(
      `Workspace limit reached (${max} on your plan). Upgrade to add more.`,
    );
  }
}

export async function getDefaultWorkspace(organizationId: string, userId: string) {
  await requireOrganizationAccess(organizationId, userId);

  const workspaces = await prisma.workspace.findMany({
    where: { organizationId, deletedAt: null, status: WorkspaceStatus.active },
    orderBy: { createdAt: "asc" },
  });

  const marked = workspaces.find(
    (ws) => parseWorkspaceSettings(ws.settings).isDefault === true,
  );
  return marked ?? workspaces[0] ?? null;
}

export async function createWorkspace(
  organizationId: string,
  userId: string,
  input: { name: string; industry?: string; timezone?: string },
) {
  await requireOrganizationAccess(organizationId, userId, OrgRole.admin);
  await assertWorkspaceLimit(organizationId);

  const parsed = createWorkspaceSchema.safeParse(input);
  if (!parsed.success) {
    throw new WorkspaceValidationError(
      "Invalid input",
      parsed.error.flatten().fieldErrors as Record<string, string[]>,
    );
  }

  const existingCount = await prisma.workspace.count({
    where: { organizationId, deletedAt: null },
  });

  const isFirst = existingCount === 0;
  const settings: WorkspaceSettings = isFirst ? { isDefault: true } : {};

  const workspace = await prisma.$transaction(async (tx) => {
    const ws = await tx.workspace.create({
      data: {
        organizationId,
        name: parsed.data.name.trim(),
        industry: parsed.data.industry?.trim() || null,
        timezone: parsed.data.timezone ?? "UTC",
        settings: settings as Prisma.InputJsonValue,
      },
    });

    await tx.workspaceMember.create({
      data: {
        workspaceId: ws.id,
        userId,
        role: WorkspaceRole.admin,
        status: "active",
      },
    });

    return ws;
  });

  await writeWorkspaceAuditLog({
    organizationId,
    actorId: userId,
    action: "workspace.created",
    resourceType: "workspace",
    resourceId: workspace.id,
    metadata: { name: workspace.name, isDefault: isFirst },
  });

  return workspace;
}

export async function updateWorkspace(
  workspaceId: string,
  userId: string,
  input: { name?: string; industry?: string | null; timezone?: string },
) {
  const { workspace, organizationId } = await requireWorkspaceAccess(
    workspaceId,
    userId,
    WorkspaceRole.admin,
  );

  const parsed = updateWorkspaceSchema.safeParse(input);
  if (!parsed.success) {
    throw new WorkspaceValidationError(
      "Invalid input",
      parsed.error.flatten().fieldErrors as Record<string, string[]>,
    );
  }

  const updated = await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      ...(parsed.data.name ? { name: parsed.data.name.trim() } : {}),
      ...(parsed.data.industry !== undefined ? { industry: parsed.data.industry } : {}),
      ...(parsed.data.timezone ? { timezone: parsed.data.timezone } : {}),
    },
  });

  await writeWorkspaceAuditLog({
    organizationId,
    actorId: userId,
    action: "workspace.updated",
    resourceType: "workspace",
    resourceId: workspaceId,
    metadata: parsed.data,
  });

  return updated;
}

export async function deleteWorkspace(workspaceId: string, userId: string) {
  const { workspace, organizationId, orgRole, workspaceRole } =
    await requireWorkspaceAccess(workspaceId, userId, WorkspaceRole.admin);

  const canDelete =
    hasOrgRole(orgRole, OrgRole.admin) ||
    (workspaceRole && workspaceRole === WorkspaceRole.admin);
  if (!canDelete) throw new WorkspaceForbiddenError();

  const settings = parseWorkspaceSettings(workspace.settings);
  if (settings.isDefault) {
    throw new WorkspaceValidationError(
      "Cannot delete the default workspace. Set another workspace as default first.",
    );
  }

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      deletedAt: new Date(),
      status: WorkspaceStatus.archived,
    },
  });

  await writeWorkspaceAuditLog({
    organizationId,
    actorId: userId,
    action: "workspace.deleted",
    resourceType: "workspace",
    resourceId: workspaceId,
  });
}

export async function setDefaultWorkspace(
  organizationId: string,
  workspaceId: string,
  userId: string,
) {
  await requireOrganizationAccess(organizationId, userId, OrgRole.admin);

  const target = await prisma.workspace.findFirst({
    where: { id: workspaceId, organizationId, deletedAt: null },
  });
  if (!target) throw new WorkspaceNotFoundError();

  const all = await prisma.workspace.findMany({
    where: { organizationId, deletedAt: null },
    select: { id: true, settings: true },
  });

  await prisma.$transaction(
    all.map((ws) =>
      prisma.workspace.update({
        where: { id: ws.id },
        data: {
          settings: {
            ...parseWorkspaceSettings(ws.settings),
            isDefault: ws.id === workspaceId,
          } as Prisma.InputJsonValue,
        },
      }),
    ),
  );

  await writeWorkspaceAuditLog({
    organizationId,
    actorId: userId,
    action: "workspace.default_set",
    resourceType: "workspace",
    resourceId: workspaceId,
  });
}

export async function getWorkspaceProfile(workspaceId: string, userId: string) {
  const workspace = await getWorkspaceForUser(workspaceId, userId);
  if (!workspace) throw new WorkspaceNotFoundError();
  return workspace;
}

export async function ensureWorkspaceMembershipForSwitch(
  workspaceId: string,
  userId: string,
  organizationId: string,
) {
  const existing = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
    select: { status: true },
  });
  if (existing?.status === "active") return;

  const { role: orgRole } = await requireOrganizationAccess(organizationId, userId);
  if (!hasOrgRole(orgRole, OrgRole.admin)) {
    throw new WorkspaceForbiddenError();
  }

  if (existing) {
    await prisma.workspaceMember.update({
      where: { workspaceId_userId: { workspaceId, userId } },
      data: { role: WorkspaceRole.admin, status: "active" },
    });
  } else {
    await prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId,
        role: WorkspaceRole.admin,
        status: "active",
      },
    });
  }
}
