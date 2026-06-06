import type { OrgRole, WorkspaceRole } from "@prisma/client";

/** Tenant context injected per request — mirrors AsyncLocalStorage in the API layer. */
export interface TenantContext {
  userId: string;
  organizationId: string;
  orgRole: OrgRole;
  workspaceId?: string;
  workspaceRole?: WorkspaceRole;
}

export function requireWorkspace(ctx: TenantContext): asserts ctx is TenantContext & { workspaceId: string } {
  if (!ctx.workspaceId) {
    throw new Error("TenantContext: workspaceId is required but not set");
  }
}

export function requireOrg(ctx: TenantContext): asserts ctx is TenantContext & { organizationId: string } {
  if (!ctx.organizationId) {
    throw new Error("TenantContext: organizationId is required but not set");
  }
}
