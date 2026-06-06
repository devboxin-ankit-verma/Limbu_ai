import { hasPermission } from "@limbu/auth/rbac";
import { requireOrganizationAccess } from "@limbu/org";
import { AnalyticsForbiddenError } from "./errors";

export async function requireAnalyticsAccess(
  organizationId: string,
  userId: string,
  isSuperAdmin = false,
) {
  const { org, role } = await requireOrganizationAccess(organizationId, userId);

  const allowed = hasPermission("org:analytics:read", {
    isSuperAdmin,
    orgRole: role,
    workspaceRole: null,
  });

  if (!allowed) {
    throw new AnalyticsForbiddenError("Analytics access requires org viewer role or higher");
  }

  return { org, role };
}

export function requirePlatformAnalyticsAccess(isSuperAdmin: boolean) {
  if (!isSuperAdmin) {
    throw new AnalyticsForbiddenError("Platform analytics requires super admin");
  }
}
