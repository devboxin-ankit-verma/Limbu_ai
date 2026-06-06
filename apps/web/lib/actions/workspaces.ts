"use server";

import { unstable_update } from "@/auth";
import { switchTenantContext } from "@limbu/auth";
import {
  createWorkspace,
  deleteWorkspace,
  ensureWorkspaceMembershipForSwitch,
  getWorkspaceProfile,
  isWorkspaceError,
  listWorkspacesForUser,
  requireWorkspaceAccess,
  setDefaultWorkspace,
  updateWorkspace,
} from "@limbu/workspace";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/session";

export type WorkspaceActionResult = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  workspaceId?: string;
};

function handleWorkspaceError(err: unknown): WorkspaceActionResult {
  if (isWorkspaceError(err)) {
    return {
      error: err.message,
      fieldErrors: "fieldErrors" in err ? (err.fieldErrors as Record<string, string[]>) : undefined,
    };
  }
  throw err;
}

async function getActorId() {
  const session = await requireAuth();
  return session.user.id;
}

export async function createWorkspaceAction(
  organizationId: string,
  _prev: WorkspaceActionResult,
  formData: FormData,
): Promise<WorkspaceActionResult> {
  const userId = await getActorId();

  try {
    const workspace = await createWorkspace(organizationId, userId, {
      name: String(formData.get("name") ?? ""),
      industry: formData.get("industry") ? String(formData.get("industry")) : undefined,
      timezone: formData.get("timezone") ? String(formData.get("timezone")) : undefined,
    });

    const ctx = await switchTenantContext(userId, organizationId, workspace.id);
    await unstable_update({
      organizationId: ctx.organizationId,
      orgRole: ctx.orgRole,
      workspaceId: ctx.workspaceId,
      workspaceRole: ctx.workspaceRole,
    } as Parameters<typeof unstable_update>[0]);

    revalidatePath(`/organizations/${organizationId}/workspaces`);
    redirect(`/organizations/${organizationId}/workspaces/${workspace.id}/settings`);
  } catch (err) {
    return handleWorkspaceError(err);
  }
}

export async function updateWorkspaceAction(
  organizationId: string,
  workspaceId: string,
  _prev: WorkspaceActionResult,
  formData: FormData,
): Promise<WorkspaceActionResult> {
  const userId = await getActorId();

  try {
    await updateWorkspace(workspaceId, userId, {
      name: formData.get("name") ? String(formData.get("name")) : undefined,
      industry: formData.has("industry")
        ? formData.get("industry")
          ? String(formData.get("industry"))
          : null
        : undefined,
      timezone: formData.get("timezone") ? String(formData.get("timezone")) : undefined,
    });

    revalidatePath(`/organizations/${organizationId}/workspaces/${workspaceId}`);
    return { success: true, workspaceId };
  } catch (err) {
    return handleWorkspaceError(err);
  }
}

export async function deleteWorkspaceFormAction(
  organizationId: string,
  workspaceId: string,
  _prev: WorkspaceActionResult,
  _formData: FormData,
): Promise<WorkspaceActionResult> {
  return deleteWorkspaceAction(organizationId, workspaceId);
}

export async function deleteWorkspaceAction(
  organizationId: string,
  workspaceId: string,
): Promise<WorkspaceActionResult> {
  const userId = await getActorId();

  try {
    await deleteWorkspace(workspaceId, userId);
    revalidatePath(`/organizations/${organizationId}/workspaces`);
    redirect(`/organizations/${organizationId}/workspaces`);
  } catch (err) {
    return handleWorkspaceError(err);
  }
}

export async function setDefaultWorkspaceFormAction(
  organizationId: string,
  workspaceId: string,
  _prev: WorkspaceActionResult,
  _formData: FormData,
): Promise<WorkspaceActionResult> {
  return setDefaultWorkspaceAction(organizationId, workspaceId);
}

export async function setDefaultWorkspaceAction(
  organizationId: string,
  workspaceId: string,
): Promise<WorkspaceActionResult> {
  const userId = await getActorId();

  try {
    await setDefaultWorkspace(organizationId, workspaceId, userId);
    revalidatePath(`/organizations/${organizationId}/workspaces`);
    revalidatePath(`/organizations/${organizationId}/workspaces/${workspaceId}`);
    return { success: true };
  } catch (err) {
    return handleWorkspaceError(err);
  }
}

export async function switchWorkspaceSimple(organizationId: string, workspaceId: string) {
  await switchWorkspaceAction(organizationId, workspaceId);
}

export async function switchWorkspaceFormAction(
  organizationId: string,
  workspaceId: string,
  _prev: WorkspaceActionResult,
  _formData: FormData,
): Promise<WorkspaceActionResult> {
  return switchWorkspaceAction(organizationId, workspaceId);
}

export async function switchWorkspaceAction(
  organizationId: string,
  workspaceId: string,
): Promise<WorkspaceActionResult> {
  const session = await requireAuth();

  try {
    await requireWorkspaceAccess(workspaceId, session.user.id);
    await ensureWorkspaceMembershipForSwitch(
      workspaceId,
      session.user.id,
      organizationId,
    );

    const ctx = await switchTenantContext(
      session.user.id,
      organizationId,
      workspaceId,
    );
    await unstable_update({
      organizationId: ctx.organizationId,
      orgRole: ctx.orgRole,
      workspaceId: ctx.workspaceId,
      workspaceRole: ctx.workspaceRole,
    } as Parameters<typeof unstable_update>[0]);

    revalidatePath("/dashboard");
    return { success: true, workspaceId };
  } catch (err) {
    if (isWorkspaceError(err)) {
      return { error: err.message };
    }
    return { error: "Access denied" };
  }
}

export async function listWorkspacesAction(organizationId: string) {
  const userId = await getActorId();
  return listWorkspacesForUser(organizationId, userId);
}

export async function getWorkspaceData(organizationId: string, workspaceId: string) {
  const userId = await getActorId();
  const workspace = await getWorkspaceProfile(workspaceId, userId);
  if (workspace.organizationId !== organizationId) {
    throw new Error("WORKSPACE_NOT_FOUND");
  }
  return workspace;
}
