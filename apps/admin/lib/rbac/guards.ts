import {
  hasPermission,
  listGrantedPermissions,
  matchRouteRule,
  resolveEffectiveWorkspaceRole,
  type AuthorizationContext,
  type Permission,
} from "@limbu/auth/rbac";
import {
  isSuperAdmin,
  resolveOrgRoleForUser,
  resolveWorkspaceRoleForUser,
} from "@limbu/auth/tenant";
import {
  authorizeApi,
  authorizeApiSession,
  canFromContext,
  requireAuth,
} from "@limbu/shared/session";
import { notFound, redirect } from "next/navigation";

const FORBIDDEN_URL = "/login?error=forbidden";

export async function getSessionAuthorizationContext(): Promise<AuthorizationContext> {
  const session = await requireAuth();
  return {
    isSuperAdmin: session.user.isSuperAdmin,
    orgRole: session.user.orgRole,
    workspaceRole: session.user.workspaceRole,
  };
}

export async function getOrgAuthorizationContext(
  organizationId: string,
): Promise<AuthorizationContext & { userId: string }> {
  const session = await requireAuth();
  if (session.user.isSuperAdmin) {
    return {
      userId: session.user.id,
      isSuperAdmin: true,
      orgRole: session.user.orgRole,
      workspaceRole: session.user.workspaceRole,
    };
  }

  const orgRole = await resolveOrgRoleForUser(session.user.id, organizationId);
  if (!orgRole) notFound();

  return {
    userId: session.user.id,
    isSuperAdmin: false,
    orgRole,
    workspaceRole: null,
  };
}

export async function getWorkspaceAuthorizationContext(
  organizationId: string,
  workspaceId: string,
): Promise<AuthorizationContext & { userId: string }> {
  const session = await requireAuth();
  if (session.user.isSuperAdmin) {
    return {
      userId: session.user.id,
      isSuperAdmin: true,
      orgRole: session.user.orgRole,
      workspaceRole: session.user.workspaceRole,
    };
  }

  const resolved = await resolveWorkspaceRoleForUser(session.user.id, workspaceId);
  if (!resolved || resolved.organizationId !== organizationId) notFound();

  return {
    userId: session.user.id,
    isSuperAdmin: false,
    orgRole: resolved.orgRole,
    workspaceRole: resolveEffectiveWorkspaceRole(resolved.orgRole, resolved.workspaceRole),
  };
}

export async function requireOrgPermission(organizationId: string, permission: Permission) {
  const ctx = await getOrgAuthorizationContext(organizationId);
  if (!hasPermission(permission, ctx)) redirect(FORBIDDEN_URL);
  return ctx;
}

export async function requireWorkspacePermission(
  organizationId: string,
  workspaceId: string,
  permission: Permission,
) {
  const ctx = await getWorkspaceAuthorizationContext(organizationId, workspaceId);
  if (!hasPermission(permission, ctx)) redirect(FORBIDDEN_URL);
  return ctx;
}

export async function requirePlatformAccess() {
  const session = await requireAuth();
  if (session.user.isSuperAdmin) return session;
  const allowed = await isSuperAdmin(session.user.id);
  if (!allowed) redirect(FORBIDDEN_URL);
  return session;
}

export async function getGrantedPermissionsForSession(): Promise<Permission[]> {
  const ctx = await getSessionAuthorizationContext();
  return listGrantedPermissions(ctx);
}

export async function getGrantedPermissionsForOrg(organizationId: string): Promise<Permission[]> {
  const ctx = await getOrgAuthorizationContext(organizationId);
  return listGrantedPermissions(ctx);
}

export async function getGrantedPermissionsForWorkspace(
  organizationId: string,
  workspaceId: string,
): Promise<Permission[]> {
  const ctx = await getWorkspaceAuthorizationContext(organizationId, workspaceId);
  return listGrantedPermissions(ctx);
}

export async function requireRouteAccess(pathname: string) {
  const rule = matchRouteRule(pathname);
  if (!rule) return requireAuth();

  if (rule.scope === "platform") {
    return requirePlatformAccess();
  }

  const orgIdMatch = pathname.match(/^\/organizations\/([^/]+)/);
  const workspaceIdMatch = pathname.match(/^\/organizations\/[^/]+\/workspaces\/([^/]+)/);

  if (rule.scope === "workspace" && orgIdMatch && workspaceIdMatch) {
    await requireWorkspacePermission(orgIdMatch[1], workspaceIdMatch[1], rule.permission);
    return requireAuth();
  }

  if ((rule.scope === "org" || rule.scope === "session") && orgIdMatch) {
    await requireOrgPermission(orgIdMatch[1], rule.permission);
    return requireAuth();
  }

  const session = await requireAuth();
  if (
    !hasPermission(rule.permission, {
      isSuperAdmin: session.user.isSuperAdmin,
      orgRole: session.user.orgRole,
      workspaceRole: session.user.workspaceRole,
    })
  ) {
    redirect(FORBIDDEN_URL);
  }

  return session;
}

export { canFromContext, authorizeApi, authorizeApiSession };
