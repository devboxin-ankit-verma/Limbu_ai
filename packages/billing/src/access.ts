import { hasPermission } from "@limbu/auth/rbac";
import { OrgRole } from "@limbu/db";
import { requireOrganizationAccess } from "@limbu/org";
import { BillingForbiddenError } from "./errors";

export async function requireBillingAccess(
  organizationId: string,
  userId: string,
  isSuperAdmin = false,
) {
  const { org, role } = await requireOrganizationAccess(organizationId, userId);

  const canManage = hasPermission("org:billing:manage", {
    isSuperAdmin,
    orgRole: role,
    workspaceRole: null,
  });

  if (!canManage && role !== OrgRole.owner && !isSuperAdmin) {
    throw new BillingForbiddenError("Billing management requires owner or billing role");
  }

  return { org, role };
}

export async function requireBillingReadAccess(
  organizationId: string,
  userId: string,
  isSuperAdmin = false,
) {
  const { org, role } = await requireOrganizationAccess(organizationId, userId, OrgRole.billing);
  return { org, role };
}
