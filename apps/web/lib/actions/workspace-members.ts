"use server";

import {
  addWorkspaceMember,
  isWorkspaceError,
  listEligibleOrgMembers,
  listWorkspaceMembers,
  reactivateWorkspaceMember,
  removeWorkspaceMember,
  suspendWorkspaceMember,
  updateWorkspaceMemberRole,
} from "@limbu/workspace";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/session";
import type { WorkspaceActionResult } from "./workspaces";

function handleWorkspaceError(err: unknown): WorkspaceActionResult {
  if (isWorkspaceError(err)) {
    return {
      error: err.message,
      fieldErrors: "fieldErrors" in err ? (err.fieldErrors as Record<string, string[]>) : undefined,
    };
  }
  throw err;
}

export async function addWorkspaceMemberAction(
  organizationId: string,
  workspaceId: string,
  _prev: WorkspaceActionResult,
  formData: FormData,
): Promise<WorkspaceActionResult> {
  const session = await requireAuth();

  try {
    await addWorkspaceMember(workspaceId, session.user.id, {
      userId: String(formData.get("userId") ?? ""),
      role: String(formData.get("role") ?? "viewer") as
        | "admin"
        | "approver"
        | "editor"
        | "viewer",
    });

    revalidatePath(`/organizations/${organizationId}/workspaces/${workspaceId}/members`);
    return { success: true };
  } catch (err) {
    return handleWorkspaceError(err);
  }
}

export async function updateWorkspaceMemberRoleAction(
  organizationId: string,
  workspaceId: string,
  memberId: string,
  role: "admin" | "approver" | "editor" | "viewer",
): Promise<WorkspaceActionResult> {
  const session = await requireAuth();

  try {
    await updateWorkspaceMemberRole(workspaceId, session.user.id, memberId, role);
    revalidatePath(`/organizations/${organizationId}/workspaces/${workspaceId}/members`);
    return { success: true };
  } catch (err) {
    return handleWorkspaceError(err);
  }
}

export async function suspendWorkspaceMemberAction(
  organizationId: string,
  workspaceId: string,
  memberId: string,
): Promise<WorkspaceActionResult> {
  const session = await requireAuth();

  try {
    await suspendWorkspaceMember(workspaceId, session.user.id, memberId);
    revalidatePath(`/organizations/${organizationId}/workspaces/${workspaceId}/members`);
    return { success: true };
  } catch (err) {
    return handleWorkspaceError(err);
  }
}

export async function reactivateWorkspaceMemberAction(
  organizationId: string,
  workspaceId: string,
  memberId: string,
): Promise<WorkspaceActionResult> {
  const session = await requireAuth();

  try {
    await reactivateWorkspaceMember(workspaceId, session.user.id, memberId);
    revalidatePath(`/organizations/${organizationId}/workspaces/${workspaceId}/members`);
    return { success: true };
  } catch (err) {
    return handleWorkspaceError(err);
  }
}

export async function removeWorkspaceMemberAction(
  organizationId: string,
  workspaceId: string,
  memberId: string,
): Promise<WorkspaceActionResult> {
  const session = await requireAuth();

  try {
    await removeWorkspaceMember(workspaceId, session.user.id, memberId);
    revalidatePath(`/organizations/${organizationId}/workspaces/${workspaceId}/members`);
    return { success: true };
  } catch (err) {
    return handleWorkspaceError(err);
  }
}

export async function getWorkspaceMembersData(organizationId: string, workspaceId: string) {
  const session = await requireAuth();
  const [members, eligible] = await Promise.all([
    listWorkspaceMembers(workspaceId, session.user.id),
    listEligibleOrgMembers(workspaceId, session.user.id).catch(() => []),
  ]);
  return { members, eligible };
}
