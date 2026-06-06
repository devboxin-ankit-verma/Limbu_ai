"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

type WorkspaceItem = {
  id: string;
  name: string;
  settings: unknown;
};

function isDefaultWorkspace(settings: unknown): boolean {
  if (settings && typeof settings === "object" && !Array.isArray(settings)) {
    return (settings as { isDefault?: boolean }).isDefault === true;
  }
  return false;
}

export function WorkspaceSwitcher({
  organizationId,
  workspaces,
  currentWorkspaceId,
  switchWorkspace,
}: {
  organizationId: string;
  workspaces: WorkspaceItem[];
  currentWorkspaceId: string | null | undefined;
  switchWorkspace: (
    organizationId: string,
    workspaceId: string,
  ) => Promise<{ success?: boolean; error?: string }>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (workspaces.length === 0) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <label htmlFor="workspace-switcher" style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
        Workspace
      </label>
      <select
        id="workspace-switcher"
        value={currentWorkspaceId ?? workspaces[0]?.id ?? ""}
        disabled={pending}
        onChange={(e) => {
          const workspaceId = e.target.value;
          if (!workspaceId || workspaceId === currentWorkspaceId) return;
          startTransition(async () => {
            const result = await switchWorkspace(organizationId, workspaceId);
            if (result.success) router.refresh();
          });
        }}
        style={{
          padding: "0.4rem 0.75rem",
          borderRadius: 8,
          border: "1px solid var(--border)",
          background: "var(--bg)",
          color: "var(--text)",
          fontSize: "0.875rem",
        }}
      >
        {workspaces.map((ws) => {
          const label = isDefaultWorkspace(ws.settings) ? `${ws.name} (default)` : ws.name;
          return (
            <option key={ws.id} value={ws.id}>
              {label}
            </option>
          );
        })}
      </select>
    </div>
  );
}
