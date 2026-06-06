import type { OrgRole, WorkspaceRole } from "@limbu/db";

export type WorkspaceSessionUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  organizationId?: string | null;
  orgRole?: OrgRole | null;
  workspaceId?: string | null;
  workspaceRole?: WorkspaceRole | null;
  isSuperAdmin?: boolean;
};

export type WorkspaceSessionContext = {
  userId: string;
  workspaceId: string;
  organizationId: string;
  isSuperAdmin?: boolean;
};

export type AuthSession = {
  user: WorkspaceSessionUser;
};

export type WorkspaceSessionResult =
  | { error: "Unauthorized"; session: null }
  | { error: "NO_WORKSPACE"; session: null }
  | { error: null; session: AuthSession; context: WorkspaceSessionContext };
