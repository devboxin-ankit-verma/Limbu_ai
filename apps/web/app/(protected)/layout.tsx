import { NotificationBell } from "@limbu/ui/notifications/notification-bell";
import { PermissionProvider } from "@limbu/ui/rbac/permission-provider";
import { AppShell } from "@limbu/ui/layout/app/app-shell";
import { WorkspaceSwitcherLoader } from "@limbu/ui/layout/workspace/workspace-switcher-loader";
import { getGrantedPermissionsForSession } from "@/lib/rbac/guards";
import { listWorkspacesAction, switchWorkspaceAction } from "@/lib/actions/workspaces";
import { logoutAction } from "@/lib/actions/auth";
import { requireAuth } from "@/lib/session";

export const dynamic = "force-dynamic";

function SignOutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        style={{
          padding: "0.375rem 0.75rem",
          border: "1px solid var(--border)",
          borderRadius: 6,
          background: "transparent",
          color: "var(--muted)",
          cursor: "pointer",
          fontSize: "0.8rem",
        }}
      >
        Sign out
      </button>
    </form>
  );
}

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();
  const grants = await getGrantedPermissionsForSession();
  const user = session.user;

  return (
    <PermissionProvider grants={grants}>
      <AppShell
        userName={user.name}
        userEmail={user.email}
        organizationId={user.organizationId}
        workspaceSwitcher={
          user.organizationId ? (
            <WorkspaceSwitcherLoader
              organizationId={user.organizationId}
              currentWorkspaceId={user.workspaceId}
              loadWorkspaces={listWorkspacesAction}
              switchWorkspace={switchWorkspaceAction}
            />
          ) : null
        }
        notificationBell={<NotificationBell />}
        userMenu={<SignOutButton />}
      >
        {children}
      </AppShell>
    </PermissionProvider>
  );
}
