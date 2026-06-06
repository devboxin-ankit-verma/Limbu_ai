import { OrgRole, WorkspaceRole } from "@limbu/db";
import type { Permission } from "../types";
import {
  ALL_PERMISSIONS,
  meetsOrgRole,
  meetsWorkspaceRole,
  PERMISSION_MATRIX,
} from "./matrix";

export type AuthorizationContext = {
  isSuperAdmin?: boolean;
  orgRole?: OrgRole | null;
  workspaceRole?: import("@limbu/db").WorkspaceRole | null;
};

/** Org admins/owners inherit workspace admin within their organization. */
export function resolveEffectiveWorkspaceRole(
  orgRole: OrgRole | null | undefined,
  workspaceRole: AuthorizationContext["workspaceRole"],
): AuthorizationContext["workspaceRole"] {
  if (workspaceRole) return workspaceRole;
  if (orgRole && meetsOrgRole(orgRole, OrgRole.admin)) return WorkspaceRole.admin;
  return null;
}

export function hasPermission(permission: Permission, ctx: AuthorizationContext): boolean {
  if (ctx.isSuperAdmin) return true;

  const req = PERMISSION_MATRIX[permission];
  const effectiveWsRole = resolveEffectiveWorkspaceRole(ctx.orgRole, ctx.workspaceRole);

  if (req.platformOnly) return false;

  if (req.ownerOnly) {
    return ctx.orgRole === OrgRole.owner;
  }

  if (req.orgRole && !meetsOrgRole(ctx.orgRole ?? null, req.orgRole)) {
    return false;
  }

  if (req.workspaceRole && !meetsWorkspaceRole(effectiveWsRole ?? null, req.workspaceRole)) {
    return false;
  }

  return true;
}

export function hasOrgRole(
  actual: OrgRole | null | undefined,
  minimum: OrgRole,
): boolean {
  return meetsOrgRole(actual ?? null, minimum);
}

export function hasWorkspaceRole(
  actual: AuthorizationContext["workspaceRole"],
  minimum: NonNullable<AuthorizationContext["workspaceRole"]>,
): boolean {
  return meetsWorkspaceRole(actual ?? null, minimum);
}

export function listGrantedPermissions(ctx: AuthorizationContext): Permission[] {
  return ALL_PERMISSIONS.filter((permission) => hasPermission(permission, ctx));
}

export function authorize(
  permission: Permission,
  ctx: AuthorizationContext,
): { allowed: true } | { allowed: false; permission: Permission } {
  if (hasPermission(permission, ctx)) return { allowed: true };
  return { allowed: false, permission };
}
