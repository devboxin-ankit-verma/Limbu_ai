"use client";

import type { Permission } from "@limbu/auth/rbac";
import { usePermissions } from "./permission-provider";

export function Can({
  permission,
  children,
  fallback = null,
}: {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { can } = usePermissions();
  return can(permission) ? children : fallback;
}

export function Cannot({
  permission,
  children,
  fallback = null,
}: {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { can } = usePermissions();
  return can(permission) ? fallback : children;
}
