import type { OrgRole, WorkspaceRole } from "@limbu/db";

export interface TenantSession {
  organizationId: string | null;
  orgRole: OrgRole | null;
  workspaceId: string | null;
  workspaceRole: WorkspaceRole | null;
  isSuperAdmin: boolean;
}

export interface LimbuUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  emailVerified: Date | null;
}

export interface LimbuJWT {
  id: string;
  email: string;
  name?: string | null;
  picture?: string | null;
  emailVerified?: string | null;
  organizationId?: string | null;
  orgRole?: OrgRole | null;
  workspaceId?: string | null;
  workspaceRole?: WorkspaceRole | null;
  isSuperAdmin?: boolean;
  sessionId?: string;
}

export interface LimbuSession {
  user: LimbuUser & TenantSession;
  expires: string;
}

export type Permission =
  | "platform:access"
  | "platform:organizations:read"
  | "platform:organizations:manage"
  | "platform:users:manage"
  | "org:read"
  | "org:manage"
  | "org:delete"
  | "org:transfer_ownership"
  | "org:members:read"
  | "org:members:manage"
  | "org:billing:manage"
  | "workspace:create"
  | "workspace:read"
  | "workspace:manage"
  | "workspace:members:read"
  | "workspace:members:manage"
  | "content:view"
  | "content:edit"
  | "content:approve"
  | "org:analytics:read"
  | "platform:analytics:read"
  | "user:notifications:read"
  | "user:notifications:manage";
