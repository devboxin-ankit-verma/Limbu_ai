import { canFromContext, requireOrgPermission } from "@/lib/rbac/guards";
import { listWorkspacesAction, switchWorkspaceSimple } from "@/lib/actions/workspaces";
import { requireAuth } from "@/lib/session";
import { getOrganizationProfile } from "@limbu/org";
import { parseWorkspaceSettings } from "@limbu/workspace";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function WorkspacesPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const authCtx = await requireOrgPermission(orgId, "workspace:read");
  const session = await requireAuth();

  const org = await getOrganizationProfile(orgId, authCtx.userId).catch(() => null);
  if (!org) notFound();

  const workspaces = await listWorkspacesAction(orgId);
  const canCreate = canFromContext(authCtx, "workspace:create");

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
        <div>
          <h1>Workspaces</h1>
          <p style={{ color: "var(--muted)" }}>{org.name}</p>
        </div>
        {canCreate && (
          <Link
            href={`/organizations/${orgId}/workspaces/new`}
            style={{
              padding: "0.75rem 1.25rem",
              background: "var(--primary)",
              color: "white",
              borderRadius: 8,
            }}
          >
            Create workspace
          </Link>
        )}
      </header>

      {workspaces.length === 0 ? (
        <section
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <p style={{ marginBottom: "1rem" }}>No workspaces yet.</p>
          {canCreate && (
            <Link href={`/organizations/${orgId}/workspaces/new`}>Create your first workspace</Link>
          )}
        </section>
      ) : (
        <ul style={{ display: "grid", gap: "1rem", listStyle: "none" }}>
          {workspaces.map((ws) => {
            const settings = parseWorkspaceSettings(ws.settings);
            const isActive = session.user.workspaceId === ws.id;

            return (
              <li
                key={ws.id}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: "1.25rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <Link
                      href={`/organizations/${orgId}/workspaces/${ws.id}/settings`}
                      style={{ fontWeight: 600, color: "var(--text)" }}
                    >
                      {ws.name}
                    </Link>
                    <p style={{ color: "var(--muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                      {ws.timezone}
                      {ws.industry ? ` · ${ws.industry}` : ""}
                      {ws.membershipRole ? ` · ${ws.membershipRole}` : ""}
                      {ws._count.members} members
                    </p>
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
                      {isActive && (
                        <span style={{ fontSize: "0.75rem", color: "var(--success)" }}>
                          Active workspace
                        </span>
                      )}
                      {settings.isDefault && (
                        <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Default</span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    {!isActive && (
                      <form action={switchWorkspaceSimple.bind(null, orgId, ws.id)}>
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
                          Switch
                        </button>
                      </form>
                    )}
                    <Link
                      href={`/organizations/${orgId}/workspaces/${ws.id}/settings`}
                      style={{
                        padding: "0.5rem 1rem",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                      }}
                    >
                      Manage
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p style={{ marginTop: "2rem" }}>
        <Link href={`/organizations/${orgId}/settings`}>← Back to organization</Link>
      </p>
    </main>
  );
}
