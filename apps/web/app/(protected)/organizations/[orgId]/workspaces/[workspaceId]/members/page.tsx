import { WorkspaceShell } from "@limbu/ui/layout/workspace/workspace-shell";
import { getWorkspaceMembersData } from "@/lib/actions/workspace-members";
import { canFromContext, requireWorkspacePermission } from "@/lib/rbac/guards";
import { MembersClient } from "./members-client";

export const dynamic = "force-dynamic";

export default async function WorkspaceMembersPage({
  params,
}: {
  params: Promise<{ orgId: string; workspaceId: string }>;
}) {
  const { orgId, workspaceId } = await params;
  const authCtx = await requireWorkspacePermission(
    orgId,
    workspaceId,
    "workspace:members:read",
  );

  const { members, eligible } = await getWorkspaceMembersData(orgId, workspaceId);
  const canManage = canFromContext(authCtx, "workspace:members:manage");

  return (
    <WorkspaceShell orgId={orgId} workspaceId={workspaceId} active="members">
      <MembersClient
        orgId={orgId}
        workspaceId={workspaceId}
        activeMembers={members.active}
        suspendedMembers={members.suspended}
        eligible={eligible}
        canManage={canManage}
        currentUserId={authCtx.userId}
      />
    </WorkspaceShell>
  );
}
