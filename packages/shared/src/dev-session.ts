import type { AuthSession } from "./types/session";

/** Fixed IDs — must match packages/db/prisma/seed-dev-tenant.ts */
export const DEV_USER_ID = "00000000-0000-4000-8000-000000000099";
export const DEV_ORG_ID = "00000000-0000-4000-8000-000000000001";
export const DEV_WORKSPACE_ID = "00000000-0000-4000-8000-000000000002";

export function isDevAuthBypassEnabled(): boolean {
  return process.env.DEV_SKIP_AUTH === "true";
}

export function getDevMockSession(): AuthSession {
  return {
    user: {
      id: DEV_USER_ID,
      email: "dev@limbu.local",
      name: "Dev User",
      organizationId: DEV_ORG_ID,
      orgRole: "owner",
      workspaceId: DEV_WORKSPACE_ID,
      workspaceRole: "admin",
      isSuperAdmin: true,
    },
  };
}
