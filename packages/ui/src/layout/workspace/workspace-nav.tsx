import Link from "next/link";

const linkStyle = (active: boolean): React.CSSProperties => ({
  padding: "0.5rem 1rem",
  borderRadius: 8,
  fontSize: "0.875rem",
  background: active ? "var(--primary)" : "transparent",
  color: active ? "white" : "var(--text)",
  border: active ? "none" : "1px solid var(--border)",
});

export function WorkspaceNav({
  orgId,
  workspaceId,
  active,
}: {
  orgId: string;
  workspaceId: string;
  active: "settings" | "members";
}) {
  return (
    <nav style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", flexWrap: "wrap" }}>
      <Link
        href={`/organizations/${orgId}/workspaces/${workspaceId}/settings`}
        style={linkStyle(active === "settings")}
      >
        Settings
      </Link>
      <Link
        href={`/organizations/${orgId}/workspaces/${workspaceId}/members`}
        style={linkStyle(active === "members")}
      >
        Members
      </Link>
      <Link
        href={`/organizations/${orgId}/workspaces`}
        style={{ ...linkStyle(false), marginLeft: "auto" }}
      >
        All workspaces
      </Link>
    </nav>
  );
}
