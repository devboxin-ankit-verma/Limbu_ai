"use server";

import {
  reactivateMemberAction,
  removeMemberAction,
  revokeInvitationAction,
  suspendMemberAction,
} from "./members";

export async function suspendMemberFormAction(orgId: string, memberId: string) {
  await suspendMemberAction(orgId, memberId);
}

export async function reactivateMemberFormAction(orgId: string, memberId: string) {
  await reactivateMemberAction(orgId, memberId);
}

export async function removeMemberFormAction(orgId: string, memberId: string) {
  await removeMemberAction(orgId, memberId);
}

export async function revokeInvitationFormAction(orgId: string, invitationId: string) {
  await revokeInvitationAction(orgId, invitationId);
}
