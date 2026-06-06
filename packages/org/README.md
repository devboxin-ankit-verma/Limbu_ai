# @limbu/org

Organization management services for the Limbu multi-tenant SaaS platform.

## Features

- Organization CRUD (create, update, soft-delete)
- Ownership transfer
- Member management (invite, suspend, reactivate, remove)
- Invitation flow with email delivery
- Tenant isolation (404 for cross-org access)
- RBAC enforcement via `@limbu/auth`

## Org roles (schema)

| UI role | DB `OrgRole` | Permissions |
|---------|--------------|-------------|
| Owner | `owner` | Full control, delete org, transfer ownership |
| Admin | `admin` | Manage settings, members, invitations |
| Member | `member` | Read org, access workspaces |
| Viewer | `member` | Read-only at org level (same DB role) |

## Usage

```typescript
import { createOrganization, inviteMember, requireOrganizationAccess } from "@limbu/org";

const org = await createOrganization(userId, { name: "Acme Agency" });
await requireOrganizationAccess(org.id, userId, "admin");
```

## Security

- All queries scoped by `organizationId` + active membership
- Cross-tenant access returns `OrgNotFoundError` (404), never 403
- Audit log written for all mutating operations
