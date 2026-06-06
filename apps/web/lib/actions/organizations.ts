"use server";

import { unstable_update } from "@/auth";
import { switchTenantContext } from "@limbu/auth";
import { OrgRole } from "@limbu/db";
import {
  createOrganization,
  deleteOrganization,
  getOrganizationProfile,
  isOrgError,
  listUserOrganizations,
  requireOrganizationAccess,
  transferOwnership,
  updateOrganization,
} from "@limbu/org";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/session";
import { saveOrganizationLogo } from "@/lib/org/logo";

export type OrgActionResult = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  organizationId?: string;
};

async function getActorId() {
  const session = await requireAuth();
  return session.user.id;
}

function handleOrgError(err: unknown): OrgActionResult {
  if (isOrgError(err)) {
    return {
      error: err.message,
      fieldErrors: "fieldErrors" in err ? (err.fieldErrors as Record<string, string[]>) : undefined,
    };
  }
  throw err;
}

export async function createOrganizationAction(
  _prev: OrgActionResult,
  formData: FormData,
): Promise<OrgActionResult> {
  const userId = await getActorId();

  try {
    const org = await createOrganization(userId, {
      name: String(formData.get("name") ?? ""),
      slug: formData.get("slug") ? String(formData.get("slug")) : undefined,
    });

    const ctx = await switchTenantContext(userId, org.id);
    await unstable_update({
      organizationId: ctx.organizationId,
      orgRole: ctx.orgRole,
      workspaceId: ctx.workspaceId,
      workspaceRole: ctx.workspaceRole,
    } as Parameters<typeof unstable_update>[0]);

    revalidatePath("/dashboard");
    redirect(`/organizations/${org.id}/settings`);
  } catch (err) {
    return handleOrgError(err);
  }
}

export async function updateOrganizationAction(
  organizationId: string,
  _prev: OrgActionResult,
  formData: FormData,
): Promise<OrgActionResult> {
  const userId = await getActorId();

  try {
    await updateOrganization(organizationId, userId, {
      name: formData.get("name") ? String(formData.get("name")) : undefined,
      slug: formData.get("slug") ? String(formData.get("slug")) : undefined,
    });

    revalidatePath(`/organizations/${organizationId}`);
    return { success: true, organizationId };
  } catch (err) {
    return handleOrgError(err);
  }
}

export async function deleteOrganizationFormAction(
  organizationId: string,
  _prev: OrgActionResult,
  _formData: FormData,
): Promise<OrgActionResult> {
  return deleteOrganizationAction(organizationId);
}

export async function deleteOrganizationAction(
  organizationId: string,
): Promise<OrgActionResult> {
  const userId = await getActorId();

  try {
    await deleteOrganization(organizationId, userId);
    revalidatePath("/dashboard");
    redirect("/organizations");
  } catch (err) {
    return handleOrgError(err);
  }
}

export async function uploadOrganizationLogoAction(
  organizationId: string,
  _prev: OrgActionResult,
  formData: FormData,
): Promise<OrgActionResult> {
  const userId = await getActorId();
  const file = formData.get("logo");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please select a logo file" };
  }

  try {
    await requireOrganizationAccess(organizationId, userId, OrgRole.admin);
    await saveOrganizationLogo(organizationId, file);
    revalidatePath(`/organizations/${organizationId}`);
    return { success: true };
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "INVALID_FILE_TYPE") return { error: "File must be PNG, JPEG, WebP, or SVG" };
      if (err.message === "FILE_TOO_LARGE") return { error: "Logo must be under 2 MB" };
    }
    return handleOrgError(err);
  }
}

export async function transferOwnershipFormAction(
  organizationId: string,
  _prev: OrgActionResult,
  formData: FormData,
): Promise<OrgActionResult> {
  const memberId = String(formData.get("memberId") ?? "");
  if (!memberId) return { error: "Select a member" };
  return transferOwnershipAction(organizationId, memberId);
}

export async function transferOwnershipAction(
  organizationId: string,
  newOwnerMemberId: string,
): Promise<OrgActionResult> {
  const userId = await getActorId();

  try {
    await transferOwnership(organizationId, userId, newOwnerMemberId);
    revalidatePath(`/organizations/${organizationId}`);
    return { success: true };
  } catch (err) {
    return handleOrgError(err);
  }
}

export async function switchOrganizationSimple(organizationId: string) {
  await switchOrganizationAction(organizationId);
}

export async function switchOrganizationFormAction(
  organizationId: string,
  _prev: OrgActionResult,
  _formData: FormData,
): Promise<OrgActionResult> {
  return switchOrganizationAction(organizationId);
}

export async function switchOrganizationAction(
  organizationId: string,
): Promise<OrgActionResult> {
  const session = await requireAuth();

  try {
    const ctx = await switchTenantContext(session.user.id, organizationId);
    await unstable_update({
      organizationId: ctx.organizationId,
      orgRole: ctx.orgRole,
      workspaceId: ctx.workspaceId,
      workspaceRole: ctx.workspaceRole,
    } as Parameters<typeof unstable_update>[0]);

    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "Access denied" };
  }
}

export async function listOrganizationsAction() {
  const userId = await getActorId();
  return listUserOrganizations(userId);
}
