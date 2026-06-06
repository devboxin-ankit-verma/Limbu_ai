import type { OrgRole, WorkspaceRole } from "@limbu/db";

/**
 * Product-facing roles mapped to org/workspace enums.
 *
 * - super_admin → User.isSuperAdmin
 * - organization_owner → OrgRole.owner
 * - organization_admin → OrgRole.admin
 * - workspace_admin → WorkspaceRole.admin (org admin inherits)
 * - member → OrgRole.member + WorkspaceRole.editor
 * - viewer → OrgRole.viewer + WorkspaceRole.viewer
 */
export const APPLICATION_ROLES = [
  "super_admin",
  "organization_owner",
  "organization_admin",
  "workspace_admin",
  "member",
  "viewer",
] as const;

export type ApplicationRole = (typeof APPLICATION_ROLES)[number];

export const APPLICATION_ROLE_LABELS: Record<ApplicationRole, string> = {
  super_admin: "Super Admin",
  organization_owner: "Organization Owner",
  organization_admin: "Organization Admin",
  workspace_admin: "Workspace Admin",
  member: "Member",
  viewer: "Viewer",
};

export function resolveApplicationRoles(ctx: {
  isSuperAdmin?: boolean;
  orgRole?: OrgRole | null;
  workspaceRole?: WorkspaceRole | null;
}): ApplicationRole[] {
  const roles: ApplicationRole[] = [];

  if (ctx.isSuperAdmin) roles.push("super_admin");
  if (ctx.orgRole === "owner") roles.push("organization_owner");
  if (ctx.orgRole === "admin") roles.push("organization_admin");
  if (ctx.workspaceRole === "admin" || ctx.orgRole === "owner" || ctx.orgRole === "admin") {
    roles.push("workspace_admin");
  }
  if (ctx.orgRole === "member" || ctx.workspaceRole === "editor") roles.push("member");
  if (ctx.orgRole === "viewer" || ctx.workspaceRole === "viewer") roles.push("viewer");

  return roles;
}
