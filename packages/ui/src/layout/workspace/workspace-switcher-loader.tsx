import { WorkspaceSwitcher } from "./workspace-switcher";

type WorkspaceItem = {
  id: string;
  name: string;
  settings: unknown;
};

export async function WorkspaceSwitcherLoader({
  organizationId,
  currentWorkspaceId,
  loadWorkspaces,
  switchWorkspace,
}: {
  organizationId: string;
  currentWorkspaceId: string | null | undefined;
  loadWorkspaces: (organizationId: string) => Promise<WorkspaceItem[]>;
  switchWorkspace: (
    organizationId: string,
    workspaceId: string,
  ) => Promise<{ success?: boolean; error?: string }>;
}) {
  const workspaces = await loadWorkspaces(organizationId);
  return (
    <WorkspaceSwitcher
      organizationId={organizationId}
      workspaces={workspaces}
      currentWorkspaceId={currentWorkspaceId}
      switchWorkspace={switchWorkspace}
    />
  );
}
