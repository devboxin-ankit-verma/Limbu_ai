"use client";

import { createContext, useContext, useMemo } from "react";
import type { Permission } from "@limbu/auth/rbac";

type PermissionContextValue = {
  grants: ReadonlySet<Permission>;
  can: (permission: Permission) => boolean;
};

const PermissionContext = createContext<PermissionContextValue | null>(null);

export function PermissionProvider({
  grants,
  children,
}: {
  grants: Permission[];
  children: React.ReactNode;
}) {
  const value = useMemo(() => {
    const set = new Set(grants);
    return {
      grants: set,
      can: (permission: Permission) => set.has(permission),
    };
  }, [grants]);

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
}

export function usePermissions() {
  const ctx = useContext(PermissionContext);
  if (!ctx) {
    throw new Error("usePermissions must be used within PermissionProvider");
  }
  return ctx;
}
