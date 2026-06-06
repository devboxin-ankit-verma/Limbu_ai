import { hasPermission, type Permission } from "@limbu/auth/rbac";
import { AdminForbiddenError } from "./errors";

export function requirePlatformAdmin(isSuperAdmin: boolean, permission: Permission = "platform:access") {
  if (!hasPermission(permission, { isSuperAdmin, orgRole: null, workspaceRole: null })) {
    throw new AdminForbiddenError();
  }
}
