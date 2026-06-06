import type { OrgRole, WorkspaceRole } from "@limbu/db";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      emailVerified: Date | null;
      organizationId: string | null;
      orgRole: OrgRole | null;
      workspaceId: string | null;
      workspaceRole: WorkspaceRole | null;
      isSuperAdmin: boolean;
    };
  }

  interface User {
    emailVerified?: Date | null;
    organizationId?: string | null;
    orgRole?: OrgRole | null;
    workspaceId?: string | null;
    workspaceRole?: WorkspaceRole | null;
    isSuperAdmin?: boolean;
    sessionId?: string;
  }
}

declare module "@auth/core/types" {
  interface User {
    emailVerified?: Date | null;
    organizationId?: string | null;
    orgRole?: OrgRole | null;
    workspaceId?: string | null;
    workspaceRole?: WorkspaceRole | null;
    isSuperAdmin?: boolean;
    sessionId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    emailVerified?: string | null;
    organizationId?: string | null;
    orgRole?: OrgRole | null;
    workspaceId?: string | null;
    workspaceRole?: WorkspaceRole | null;
    isSuperAdmin?: boolean;
    sessionId?: string;
    expired?: boolean;
  }
}

export interface TenantSessionUpdate {
  organizationId?: string | null;
  orgRole?: OrgRole | null;
  workspaceId?: string | null;
  workspaceRole?: WorkspaceRole | null;
  isSuperAdmin?: boolean;
}
