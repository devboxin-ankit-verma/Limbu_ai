"use server";

import { unstable_update } from "@/auth";
import { switchTenantContext } from "@limbu/auth";
import { acceptInvitation, getInvitationByToken, isOrgError } from "@limbu/org";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/session";
import type { OrgActionResult } from "./organizations";

export async function acceptInvitationFormAction(token: string) {
  await acceptInvitationAction(token);
}

export async function acceptInvitationAction(token: string): Promise<OrgActionResult> {
  const session = await requireAuth();

  try {
    const result = await acceptInvitation(token, session.user.id, session.user.email!);

    const ctx = await switchTenantContext(session.user.id, result.organizationId);
    await unstable_update({
      organizationId: ctx.organizationId,
      orgRole: ctx.orgRole,
      workspaceId: ctx.workspaceId,
      workspaceRole: ctx.workspaceRole,
    } as Parameters<typeof unstable_update>[0]);

    revalidatePath("/dashboard");
    redirect(`/organizations/${result.organizationId}/settings?joined=1`);
  } catch (err) {
    if (isOrgError(err)) return { error: err.message };
    throw err;
  }
}

export async function getInvitationPreview(token: string) {
  return getInvitationByToken(token);
}
