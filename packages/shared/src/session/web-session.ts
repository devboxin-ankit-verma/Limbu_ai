import {
  hasOrgRole,
  hasPermission,
  hasWorkspaceRole,
  type AuthorizationContext,
  type Permission,
} from "@limbu/auth/rbac";
import type { OrgRole, WorkspaceRole } from "@limbu/db";
import type { AuthSession } from "../types/session";
import { getAuthSession } from "./auth-bridge";

const FORBIDDEN_URL = "/dashboard?error=forbidden";

export async function getSession() {
  return getAuthSession();
}

export async function requireAuth(): Promise<AuthSession> {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    const { redirect } = await import("next/navigation");
    redirect("/login");
  }
  return session as AuthSession;
}

export async function requirePermission(permission: Permission) {
  const session = await requireAuth();
  const allowed = hasPermission(permission, {
    isSuperAdmin: session.user.isSuperAdmin,
    orgRole: session.user.orgRole,
    workspaceRole: session.user.workspaceRole,
  });

  if (!allowed) {
    const { redirect } = await import("next/navigation");
    redirect(FORBIDDEN_URL);
  }

  return session;
}

export async function requireOrgRole(minimum: OrgRole) {
  const session = await requireAuth();
  if (session.user.isSuperAdmin) return session;
  if (!hasOrgRole(session.user.orgRole, minimum)) {
    const { redirect } = await import("next/navigation");
    redirect(FORBIDDEN_URL);
  }
  return session;
}

export async function requireWorkspaceRole(minimum: WorkspaceRole) {
  const session = await requireAuth();
  if (session.user.isSuperAdmin) return session;
  if (!hasWorkspaceRole(session.user.workspaceRole, minimum)) {
    const { redirect } = await import("next/navigation");
    redirect(FORBIDDEN_URL);
  }
  return session;
}

export async function requireSuperAdmin() {
  const session = await requireAuth();
  if (!session.user.isSuperAdmin) {
    const { redirect } = await import("next/navigation");
    redirect(FORBIDDEN_URL);
  }
  return session;
}

export function canFromContext(ctx: AuthorizationContext, permission: Permission): boolean {
  return hasPermission(permission, ctx);
}

export async function authorizeApi(
  permission: Permission,
  ctx: AuthorizationContext,
): Promise<Response | null> {
  if (hasPermission(permission, ctx)) return null;
  return Response.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
}

export async function authorizeApiSession(permission: Permission) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return { error: Response.json({ error: "Unauthorized" }, { status: 401 }), session: null };
  }

  const denied = await authorizeApi(permission, {
    isSuperAdmin: session.user.isSuperAdmin,
    orgRole: session.user.orgRole,
    workspaceRole: session.user.workspaceRole,
  });

  if (denied) return { error: denied, session: null };
  return { error: null, session };
}
