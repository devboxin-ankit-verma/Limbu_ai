import { OrgRole } from "@limbu/db";
import { OrgShell } from "@limbu/ui/layout/org/org-shell";
import { getMembersData } from "@/lib/actions/members";
import { canFromContext, requireOrgPermission } from "@/lib/rbac/guards";
import { MembersClient } from "./members-client";

export const dynamic = "force-dynamic";

export default async function OrganizationMembersPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const authCtx = await requireOrgPermission(orgId, "org:members:read");

  const { members, invitations } = await getMembersData(orgId);
  const canManage = canFromContext(authCtx, "org:members:manage");
  const isOwner = authCtx.orgRole === OrgRole.owner;

  return (
    <OrgShell orgId={orgId} active="members">
      <MembersClient
        orgId={orgId}
        activeMembers={members.active}
        suspendedMembers={members.suspended}
        invitations={invitations}
        canManage={canManage}
        isOwner={isOwner}
        currentUserId={authCtx.userId}
      />
    </OrgShell>
  );
}
