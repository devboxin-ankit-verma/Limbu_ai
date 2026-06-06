import type { OrgRole, WorkspaceRole } from "@limbu/db";
import type { Permission } from "../types";

export const ORG_ROLE_LEVEL: Record<OrgRole, number> = {
  owner: 5,
  admin: 4,
  member: 3,
  viewer: 2,
  billing: 1,
};

export const WS_ROLE_LEVEL: Record<WorkspaceRole, number> = {
  admin: 4,
  approver: 3,
  editor: 2,
  viewer: 1,
};

export type PermissionRequirement = {
  orgRole?: OrgRole;
  workspaceRole?: WorkspaceRole;
  /** Requires OrgRole.owner exactly (not admin). */
  ownerOnly?: boolean;
  /** Requires platform super admin. */
  platformOnly?: boolean;
};

/**
 * Authoritative permission matrix for Limbu RBAC.
 * Super admins bypass all checks in hasPermission().
 */
export const PERMISSION_MATRIX: Record<Permission, PermissionRequirement> = {
  // Platform
  "platform:access": { platformOnly: true },
  "platform:organizations:read": { platformOnly: true },
  "platform:organizations:manage": { platformOnly: true },
  "platform:users:manage": { platformOnly: true },

  // Organization
  "org:read": { orgRole: "billing" },
  "org:manage": { orgRole: "admin" },
  "org:delete": { ownerOnly: true },
  "org:transfer_ownership": { ownerOnly: true },
  "org:members:read": { orgRole: "viewer" },
  "org:members:manage": { orgRole: "admin" },
  "org:billing:manage": { orgRole: "billing" },

  // Workspace
  "workspace:create": { orgRole: "admin" },
  "workspace:read": { orgRole: "viewer" },
  "workspace:manage": { workspaceRole: "admin" },
  "workspace:members:read": { workspaceRole: "viewer" },
  "workspace:members:manage": { workspaceRole: "admin" },

  // Content (workspace-scoped)
  "content:view": { workspaceRole: "viewer" },
  "content:edit": { workspaceRole: "editor" },
  "content:approve": { workspaceRole: "approver" },

  // Analytics
  "org:analytics:read": { orgRole: "viewer" },
  "platform:analytics:read": { platformOnly: true },

  // User notifications (any authenticated user)
  "user:notifications:read": {},
  "user:notifications:manage": {},
};

export const ALL_PERMISSIONS = Object.keys(PERMISSION_MATRIX) as Permission[];

export function meetsOrgRole(actual: OrgRole | null, required: OrgRole): boolean {
  if (!actual) return false;
  return ORG_ROLE_LEVEL[actual] >= ORG_ROLE_LEVEL[required];
}

export function meetsWorkspaceRole(
  actual: WorkspaceRole | null,
  required: WorkspaceRole,
): boolean {
  if (!actual) return false;
  return WS_ROLE_LEVEL[actual] >= WS_ROLE_LEVEL[required];
}
