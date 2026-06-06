import { prisma, WorkspaceRole } from "@limbu/db";
import { writeWorkspaceAuditLog } from "../audit";
import {
  WorkspaceForbiddenError,
  WorkspaceNotFoundError,
  WorkspaceValidationError,
} from "../errors";
import {
  addWorkspaceMemberSchema,
  uiRoleToWorkspaceRole,
  updateWorkspaceMemberRoleSchema,
} from "../validators";
import { requireWorkspaceAccess } from "../access";

export async function listWorkspaceMembers(workspaceId: string, userId: string) {
  await requireWorkspaceAccess(workspaceId, userId, WorkspaceRole.viewer);

  const [active, suspended] = await Promise.all([
    prisma.workspaceMember.findMany({
      where: { workspaceId, status: "active" },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
      orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    }),
    prisma.workspaceMember.findMany({
      where: { workspaceId, status: "removed" },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return { active, suspended };
}

export async function listEligibleOrgMembers(workspaceId: string, userId: string) {
  const { organizationId } = await requireWorkspaceAccess(
    workspaceId,
    userId,
    WorkspaceRole.admin,
  );

  const orgMembers = await prisma.organizationMember.findMany({
    where: { organizationId, status: "active" },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  const wsMemberIds = new Set(
    (
      await prisma.workspaceMember.findMany({
        where: { workspaceId, status: "active" },
        select: { userId: true },
      })
    ).map((m) => m.userId),
  );

  return orgMembers
    .filter((m) => !wsMemberIds.has(m.userId))
    .map((m) => ({
      userId: m.userId,
      label: m.user.name ?? m.user.email,
      orgRole: m.role,
    }));
}

export async function addWorkspaceMember(
  workspaceId: string,
  actorId: string,
  input: { userId: string; role: "admin" | "approver" | "editor" | "viewer" },
) {
  const { organizationId } = await requireWorkspaceAccess(
    workspaceId,
    actorId,
    WorkspaceRole.admin,
  );

  const parsed = addWorkspaceMemberSchema.safeParse(input);
  if (!parsed.success) {
    throw new WorkspaceValidationError("Invalid input");
  }

  const orgMember = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId: parsed.data.userId,
      },
    },
    select: { status: true },
  });

  if (!orgMember || orgMember.status !== "active") {
    throw new WorkspaceValidationError("User must be an active organization member");
  }

  const existing = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: { workspaceId, userId: parsed.data.userId },
    },
  });

  if (existing?.status === "active") {
    throw new WorkspaceValidationError("User is already a workspace member");
  }

  const role = uiRoleToWorkspaceRole(parsed.data.role);

  if (existing) {
    await prisma.workspaceMember.update({
      where: { id: existing.id },
      data: { role, status: "active" },
    });
  } else {
    await prisma.workspaceMember.create({
      data: { workspaceId, userId: parsed.data.userId, role, status: "active" },
    });
  }

  await writeWorkspaceAuditLog({
    organizationId,
    actorId,
    action: "workspace_member.added",
    resourceType: "workspace_member",
    resourceId: workspaceId,
    metadata: { userId: parsed.data.userId, role: parsed.data.role },
  });
}

export async function updateWorkspaceMemberRole(
  workspaceId: string,
  actorId: string,
  memberId: string,
  role: "admin" | "approver" | "editor" | "viewer",
) {
  const { organizationId } = await requireWorkspaceAccess(
    workspaceId,
    actorId,
    WorkspaceRole.admin,
  );

  const parsed = updateWorkspaceMemberRoleSchema.safeParse({ role });
  if (!parsed.success) throw new WorkspaceValidationError("Invalid role");

  const member = await prisma.workspaceMember.findFirst({
    where: { id: memberId, workspaceId, status: "active" },
  });
  if (!member) throw new WorkspaceNotFoundError("Member not found");

  const newRole = uiRoleToWorkspaceRole(parsed.data.role);

  await prisma.workspaceMember.update({
    where: { id: memberId },
    data: { role: newRole },
  });

  await writeWorkspaceAuditLog({
    organizationId,
    actorId,
    action: "workspace_member.role_updated",
    resourceType: "workspace_member",
    resourceId: memberId,
    metadata: { newRole, previousRole: member.role },
  });
}

export async function suspendWorkspaceMember(
  workspaceId: string,
  actorId: string,
  memberId: string,
) {
  const { organizationId } = await requireWorkspaceAccess(
    workspaceId,
    actorId,
    WorkspaceRole.admin,
  );

  const member = await prisma.workspaceMember.findFirst({
    where: { id: memberId, workspaceId, status: "active" },
  });
  if (!member) throw new WorkspaceNotFoundError("Member not found");
  if (member.userId === actorId) {
    throw new WorkspaceForbiddenError("You cannot suspend yourself");
  }

  await prisma.workspaceMember.update({
    where: { id: memberId },
    data: { status: "removed" },
  });

  await writeWorkspaceAuditLog({
    organizationId,
    actorId,
    action: "workspace_member.suspended",
    resourceType: "workspace_member",
    resourceId: memberId,
  });
}

export async function reactivateWorkspaceMember(
  workspaceId: string,
  actorId: string,
  memberId: string,
) {
  const { organizationId } = await requireWorkspaceAccess(
    workspaceId,
    actorId,
    WorkspaceRole.admin,
  );

  const member = await prisma.workspaceMember.findFirst({
    where: { id: memberId, workspaceId, status: "removed" },
  });
  if (!member) throw new WorkspaceNotFoundError("Suspended member not found");

  await prisma.workspaceMember.update({
    where: { id: memberId },
    data: { status: "active" },
  });

  await writeWorkspaceAuditLog({
    organizationId,
    actorId,
    action: "workspace_member.reactivated",
    resourceType: "workspace_member",
    resourceId: memberId,
  });
}

export async function removeWorkspaceMember(
  workspaceId: string,
  actorId: string,
  memberId: string,
) {
  const { organizationId } = await requireWorkspaceAccess(
    workspaceId,
    actorId,
    WorkspaceRole.admin,
  );

  const member = await prisma.workspaceMember.findFirst({
    where: { id: memberId, workspaceId },
  });
  if (!member) throw new WorkspaceNotFoundError("Member not found");
  if (member.userId === actorId) {
    throw new WorkspaceForbiddenError("You cannot remove yourself");
  }

  const adminCount = await prisma.workspaceMember.count({
    where: { workspaceId, status: "active", role: WorkspaceRole.admin },
  });
  if (member.role === WorkspaceRole.admin && adminCount <= 1) {
    throw new WorkspaceValidationError("Cannot remove the last workspace admin");
  }

  await prisma.workspaceMember.delete({ where: { id: memberId } });

  await writeWorkspaceAuditLog({
    organizationId,
    actorId,
    action: "workspace_member.removed",
    resourceType: "workspace_member",
    resourceId: memberId,
  });
}
