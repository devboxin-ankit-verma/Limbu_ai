import { parseWorkspaceSettings } from "@limbu/workspace";
import { WorkspaceShell } from "@limbu/ui/layout/workspace/workspace-shell";
import { getWorkspaceData } from "@/lib/actions/workspaces";
import { canFromContext, requireWorkspacePermission } from "@/lib/rbac/guards";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

export default async function WorkspaceSettingsPage({
  params,
}: {
  params: Promise<{ orgId: string; workspaceId: string }>;
}) {
  const { orgId, workspaceId } = await params;
  const authCtx = await requireWorkspacePermission(orgId, workspaceId, "workspace:read");
  const workspace = await getWorkspaceData(orgId, workspaceId);

  const settings = parseWorkspaceSettings(workspace.settings);
  const canManage = canFromContext(authCtx, "workspace:manage");
  const canSetDefault = canFromContext(authCtx, "workspace:create");

  return (
    <WorkspaceShell orgId={orgId} workspaceId={workspaceId} active="settings">
      <SettingsForm
        orgId={orgId}
        workspaceId={workspaceId}
        name={workspace.name}
        industry={workspace.industry}
        timezone={workspace.timezone}
        isDefault={settings.isDefault === true}
        canManage={canManage}
        canSetDefault={canSetDefault}
      />
    </WorkspaceShell>
  );
}
