"use server";

import {
  reactivateWorkspaceMemberAction,
  removeWorkspaceMemberAction,
  suspendWorkspaceMemberAction,
} from "./workspace-members";

export async function suspendWorkspaceMemberFormAction(
  orgId: string,
  workspaceId: string,
  memberId: string,
) {
  await suspendWorkspaceMemberAction(orgId, workspaceId, memberId);
}

export async function reactivateWorkspaceMemberFormAction(
  orgId: string,
  workspaceId: string,
  memberId: string,
) {
  await reactivateWorkspaceMemberAction(orgId, workspaceId, memberId);
}

export async function removeWorkspaceMemberFormAction(
  orgId: string,
  workspaceId: string,
  memberId: string,
) {
  await removeWorkspaceMemberAction(orgId, workspaceId, memberId);
}
