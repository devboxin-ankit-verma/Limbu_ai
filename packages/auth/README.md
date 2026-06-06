# @limbu/auth

Authentication services, RBAC, and session utilities for Limbu.

Used by `apps/web` with Auth.js v5. Does not depend on Next.js or Auth.js directly.

## RBAC

Production-grade role-based access control with a permission matrix, route rules, and super-admin bypass.

### Application roles

| Role | Source |
|------|--------|
| Super Admin | `User.isSuperAdmin` |
| Organization Owner | `OrgRole.owner` |
| Organization Admin | `OrgRole.admin` |
| Workspace Admin | `WorkspaceRole.admin` (org admin inherits) |
| Member | `OrgRole.member` / `WorkspaceRole.editor` |
| Viewer | `OrgRole.viewer` / `WorkspaceRole.viewer` |

### Usage

```typescript
import {
  hasPermission,
  listGrantedPermissions,
  matchRouteRule,
  resolveApplicationRoles,
} from "@limbu/auth/rbac";

hasPermission("org:manage", {
  isSuperAdmin: false,
  orgRole: "admin",
  workspaceRole: null,
}); // true

resolveApplicationRoles({ orgRole: "owner", workspaceRole: "editor" });
// ["organization_owner", "workspace_admin", "member"]
```

### Permissions

See `packages/auth/src/rbac/matrix.ts` for the full matrix. Key permissions:

- **Platform**: `platform:access`, `platform:organizations:manage`, `platform:users:manage`
- **Organization**: `org:read`, `org:manage`, `org:delete`, `org:transfer_ownership`, `org:members:*`
- **Workspace**: `workspace:create`, `workspace:read`, `workspace:manage`, `workspace:members:*`
- **Content**: `content:view`, `content:edit`, `content:approve`

Super admins bypass all permission checks.

### Route protection

Route → permission mapping lives in `packages/auth/src/rbac/routes.ts`. Used by Next.js middleware (JWT fast-path) and server guards (URL-scoped DB lookup).

## Exports

- **Password** — bcrypt hashing, strength validation
- **Tokens** — secure token generation and SHA-256 hashing
- **Email** — verification and password reset emails (SMTP/Mailpit)
- **Session store** — DB-backed session + refresh token creation
- **Tenant** — org/workspace context loading and access checks
- **RBAC** — permission matrix, route rules, authorization helpers
- **User service** — register, verify, reset, OAuth linking, credentials auth
