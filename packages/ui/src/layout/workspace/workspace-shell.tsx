import { getWorkspaceProfile } from "@limbu/workspace";
import { notFound } from "next/navigation";
import { requireAuth } from "@limbu/shared/session";
import { WorkspaceNav } from "./workspace-nav";

export async function WorkspaceShell({
  orgId,
  workspaceId,
  active,
  children,
}: {
  orgId: string;
  workspaceId: string;
  active: "settings" | "members";
  children: React.ReactNode;
}) {
  const session = await requireAuth();
  const workspace = await getWorkspaceProfile(workspaceId, session.user.id).catch(() => null);

  if (!workspace || workspace.organizationId !== orgId) notFound();

  return (
    <main style={{ padding: "2rem", maxWidth: 960, margin: "0 auto" }}>
      <header style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.75rem" }}>{workspace.name}</h1>
        <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
          {workspace.timezone}
          {workspace.industry ? ` · ${workspace.industry}` : ""}
          {workspace.status !== "active" ? ` · ${workspace.status}` : ""}
        </p>
      </header>
      <WorkspaceNav orgId={orgId} workspaceId={workspaceId} active={active} />
      {children}
    </main>
  );
}
