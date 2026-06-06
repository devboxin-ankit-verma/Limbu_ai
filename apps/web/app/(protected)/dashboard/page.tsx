import Link from "next/link";
import { Can } from "@limbu/ui/rbac/can";
import { WorkspaceSwitcherLoader } from "@limbu/ui/layout/workspace/workspace-switcher-loader";
import { listWorkspacesAction, switchWorkspaceAction } from "@/lib/actions/workspaces";
import { logoutAction } from "@/lib/actions/auth";
import { requireAuth } from "@/lib/session";
import { hasPermission, resolveApplicationRoles } from "@limbu/auth/rbac";
import { redirect } from "next/navigation";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await requireAuth();
  const params = await searchParams;
  const user = session.user;

  if (!user.organizationId && !user.isSuperAdmin) {
    redirect("/organizations/new");
  }

  const authCtx = {
    isSuperAdmin: user.isSuperAdmin,
    orgRole: user.orgRole,
    workspaceRole: user.workspaceRole,
  };

  const canEdit = hasPermission("content:edit", authCtx);
  const roles = resolveApplicationRoles(authCtx);

  return (
    <main style={{ padding: "2rem", maxWidth: 800, margin: "0 auto" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h1>Dashboard</h1>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          {user.organizationId && (
            <WorkspaceSwitcherLoader
              organizationId={user.organizationId}
              currentWorkspaceId={user.workspaceId}
              loadWorkspaces={listWorkspacesAction}
              switchWorkspace={switchWorkspaceAction}
            />
          )}
          <Link href="/organizations" style={{ fontSize: "0.875rem" }}>
            Organizations
          </Link>
          <Can permission="content:view">
            <Link href="/chat" style={{ fontSize: "0.875rem" }}>
              Chat
            </Link>
          </Can>
          <Can permission="content:view">
            <Link href="/workflows" style={{ fontSize: "0.875rem" }}>
              Workflows
            </Link>
          </Can>
          <Can permission="content:view">
            <Link href="/agents" style={{ fontSize: "0.875rem" }}>
              Agents
            </Link>
          </Can>
          <Can permission="content:view">
            <Link href="/knowledge" style={{ fontSize: "0.875rem" }}>
              Knowledge
            </Link>
          </Can>
          <Can permission="workspace:read">
            {user.organizationId && (
              <Link
                href={`/organizations/${user.organizationId}/workspaces`}
                style={{ fontSize: "0.875rem" }}
              >
                Workspaces
              </Link>
            )}
          </Can>
          <Can permission="org:manage">
            {user.organizationId && (
              <Link
                href={`/organizations/${user.organizationId}/settings`}
                style={{ fontSize: "0.875rem" }}
              >
                Settings
              </Link>
            )}
          </Can>
          <Can permission="org:analytics:read">
            {user.organizationId && (
              <Link
                href={`/organizations/${user.organizationId}/analytics`}
                style={{ fontSize: "0.875rem" }}
              >
                Analytics
              </Link>
            )}
          </Can>
          <Can permission="org:billing:manage">
            {user.organizationId && (
              <Link
                href={`/organizations/${user.organizationId}/billing`}
                style={{ fontSize: "0.875rem" }}
              >
                Billing
              </Link>
            )}
          </Can>
          <Can permission="user:notifications:read">
            <Link href="/notifications" style={{ fontSize: "0.875rem" }}>
              Notifications
            </Link>
          </Can>
          {user.isSuperAdmin && (
            <a
              href={process.env.NEXT_PUBLIC_ADMIN_APP_URL ?? "http://localhost:3003"}
              style={{ fontSize: "0.875rem" }}
            >
              Platform Admin
            </a>
          )}
          <form action={logoutAction}>
            <button
              type="submit"
              style={{
                padding: "0.5rem 1rem",
                border: "1px solid var(--border)",
                borderRadius: 8,
                background: "transparent",
                color: "var(--text)",
                cursor: "pointer",
              }}
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      {params.error === "forbidden" && (
        <p style={{ color: "var(--danger)", marginBottom: "1rem" }}>
          You don&apos;t have permission to access that resource.
        </p>
      )}

      <section
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "1.5rem",
        }}
      >
        <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Session</h2>
        <dl style={{ display: "grid", gap: "0.5rem", fontSize: "0.9rem" }}>
          <div>
            <dt style={{ color: "var(--muted)" }}>User</dt>
            <dd>{user.name ?? user.email}</dd>
          </div>
          <div>
            <dt style={{ color: "var(--muted)" }}>Application roles</dt>
            <dd>{roles.length > 0 ? roles.join(", ") : "—"}</dd>
          </div>
          <div>
            <dt style={{ color: "var(--muted)" }}>Super admin</dt>
            <dd>{user.isSuperAdmin ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt style={{ color: "var(--muted)" }}>Organization</dt>
            <dd>{user.organizationId ?? "None — complete onboarding"}</dd>
          </div>
          <div>
            <dt style={{ color: "var(--muted)" }}>Org role</dt>
            <dd>{user.orgRole ?? "—"}</dd>
          </div>
          <div>
            <dt style={{ color: "var(--muted)" }}>Workspace</dt>
            <dd>{user.workspaceId ?? "None selected"}</dd>
          </div>
          <div>
            <dt style={{ color: "var(--muted)" }}>Workspace role</dt>
            <dd>{user.workspaceRole ?? "—"}</dd>
          </div>
          <div>
            <dt style={{ color: "var(--muted)" }}>Can edit content</dt>
            <dd>{canEdit ? "Yes" : "No"}</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
