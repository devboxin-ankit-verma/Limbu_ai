"use server";

import {
  inviteMember,
  isOrgError,
  listInvitations,
  listOrganizationMembers,
  reactivateMember,
  removeMember,
  revokeInvitation,
  suspendMember,
  updateMemberRole,
} from "@limbu/org";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/session";
import type { OrgActionResult } from "./organizations";

function handleOrgError(err: unknown): OrgActionResult {
  if (isOrgError(err)) {
    return {
      error: err.message,
      fieldErrors: "fieldErrors" in err ? (err.fieldErrors as Record<string, string[]>) : undefined,
    };
  }
  throw err;
}

export async function inviteMemberAction(
  organizationId: string,
  _prev: OrgActionResult,
  formData: FormData,
): Promise<OrgActionResult> {
  const session = await requireAuth();

  try {
    await inviteMember(organizationId, session.user.id, {
      email: String(formData.get("email") ?? ""),
      role: String(formData.get("role") ?? "member") as "admin" | "member" | "viewer",
    });

    revalidatePath(`/organizations/${organizationId}/members`);
    return { success: true };
  } catch (err) {
    return handleOrgError(err);
  }
}

export async function updateMemberRoleAction(
  organizationId: string,
  memberId: string,
  role: "admin" | "member" | "viewer",
): Promise<OrgActionResult> {
  const session = await requireAuth();

  try {
    await updateMemberRole(organizationId, session.user.id, memberId, role);
    revalidatePath(`/organizations/${organizationId}/members`);
    return { success: true };
  } catch (err) {
    return handleOrgError(err);
  }
}

export async function suspendMemberAction(
  organizationId: string,
  memberId: string,
): Promise<OrgActionResult> {
  const session = await requireAuth();

  try {
    await suspendMember(organizationId, session.user.id, memberId);
    revalidatePath(`/organizations/${organizationId}/members`);
    return { success: true };
  } catch (err) {
    return handleOrgError(err);
  }
}

export async function reactivateMemberAction(
  organizationId: string,
  memberId: string,
): Promise<OrgActionResult> {
  const session = await requireAuth();

  try {
    await reactivateMember(organizationId, session.user.id, memberId);
    revalidatePath(`/organizations/${organizationId}/members`);
    return { success: true };
  } catch (err) {
    return handleOrgError(err);
  }
}

export async function removeMemberAction(
  organizationId: string,
  memberId: string,
): Promise<OrgActionResult> {
  const session = await requireAuth();

  try {
    await removeMember(organizationId, session.user.id, memberId);
    revalidatePath(`/organizations/${organizationId}/members`);
    return { success: true };
  } catch (err) {
    return handleOrgError(err);
  }
}

export async function revokeInvitationAction(
  organizationId: string,
  invitationId: string,
): Promise<OrgActionResult> {
  const session = await requireAuth();

  try {
    await revokeInvitation(organizationId, session.user.id, invitationId);
    revalidatePath(`/organizations/${organizationId}/members`);
    return { success: true };
  } catch (err) {
    return handleOrgError(err);
  }
}

export async function getMembersData(organizationId: string) {
  const session = await requireAuth();
  const [members, invitations] = await Promise.all([
    listOrganizationMembers(organizationId, session.user.id),
    listInvitations(organizationId, session.user.id).catch(() => []),
  ]);
  return { members, invitations };
}
