# Phase 2 Migration Report — Shared Packages Extraction

**Date:** 2026-06-05  
**Scope:** Phase 2 only (`packages/ui` + `packages/shared`)  
**Status:** Complete

---

## Executive Summary

Phase 2 extracts cross-cutting UI components and shared utilities from `apps/web` into two new workspace packages. All imports were updated automatically; `apps/web/lib/*` paths remain as thin re-export adapters for backward compatibility with existing API routes.

No business logic was modified. No new apps were created (`api`, `admin`, `mobile`).

---

## Packages Created

### `@limbu/shared`

| Module | Contents |
|--------|----------|
| `errors/` | `LimbuError`, `ForbiddenError`, `NotFoundError`, `ValidationError`, `isLimbuError` |
| `types/` | `ActionResult`, `Paginated<T>`, `AuthSession`, `WorkspaceSessionContext`, `WorkspaceSessionResult` |
| `validators/` | `registerSchema`, `loginSchema`, `paginationSchema`, `cursorPaginationSchema` |
| `config/` | `env()`, `envBool()`, `envInt()`, `verifySecret()`, `verifyWorkerSecret()` |
| `api/` | Domain error responses, `missingWorkspaceResponse`, `requireNotificationApi`, `requireAdminApi` |
| `session/` | Auth bridge, workspace/billing/analytics session gates, web session guards, API auth helpers |

### `@limbu/ui`

| Module | Contents |
|--------|----------|
| `auth/` | `AuthCard`, `FormField`, `SubmitButton`, `OAuthButtons`, `AuthLayout` |
| `rbac/` | `Can`, `Cannot`, `PermissionProvider`, `usePermissions` |
| `notifications/` | `NotificationBell`, `NotificationCenterClient`, `NotificationPreferencesClient` |
| `layout/org/` | `OrgShell`, `OrgNav` |
| `layout/workspace/` | `WorkspaceShell`, `WorkspaceNav`, `WorkspaceSwitcher`, `WorkspaceSwitcherLoader` |
| `layout/admin/` | `AdminShell`, shared style primitives (`cardStyle`, `tableStyle`, etc.) |
| `styles/` | `globals.css` (design tokens) |

---

## What Moved

### UI (`apps/web` → `packages/ui`)

| Source | Destination |
|--------|-------------|
| `components/auth/*` (4 files) | `packages/ui/src/auth/` |
| `components/rbac/*` (2 files) | `packages/ui/src/rbac/` |
| `components/notifications/notification-bell.tsx` | `packages/ui/src/notifications/` |
| `components/org/*` | `packages/ui/src/layout/org/` |
| `components/workspace/*` | `packages/ui/src/layout/workspace/` |
| `app/(protected)/admin/admin-shell.tsx` | `packages/ui/src/layout/admin/admin-shell.tsx` |
| `app/(auth)/layout.tsx` | `packages/ui/src/auth/auth-layout.tsx` |
| `app/(protected)/notifications/notification-center-client.tsx` | `packages/ui/src/notifications/` |
| `app/(protected)/settings/notifications/notification-preferences-client.tsx` | `packages/ui/src/notifications/` |
| `app/globals.css` | `packages/ui/src/styles/globals.css` |

**Not moved (out of scope):** `components/chat/*` — feature-specific UI stays in `apps/web`.

### Shared (`apps/web/lib` → `packages/shared`)

| Category | Consolidated into |
|----------|-------------------|
| API helpers (10 domain `api.ts` files) | `packages/shared/src/api/domains.ts` |
| Session utilities (6 domain `session.ts` files) | `packages/shared/src/session/` |
| Web session guards | `packages/shared/src/session/web-session.ts` |
| RBAC API helpers (`authorizeApi`, etc.) | `packages/shared/src/session/web-session.ts` |
| Auth validators + `ActionResult` | `packages/shared/src/validators/` + `types/actions.ts` |

---

## Import Strategy

### Before

```typescript
import { AuthCard } from "@/components/auth/auth-card";
import { requireAuth } from "@/lib/session";
import { workflowErrorResponse } from "@/lib/workflows/api";
```

### After

```typescript
import { AuthCard } from "@limbu/ui/auth/auth-card";
import { requireAuth } from "@/lib/session";           // re-exports @limbu/shared/session
import { workflowErrorResponse } from "@/lib/workflows/api"; // re-exports @limbu/shared/api
```

### Auth configuration bridge

`apps/web/lib/shared-config.ts` registers NextAuth with `@limbu/shared/session`:

```typescript
import { configureAuth } from "@limbu/shared/session";
import { auth } from "@/auth";
configureAuth(() => auth());
```

Loaded from `apps/web/app/layout.tsx` before any session utilities run.

### UI decoupling (wiring only, no logic change)

| Component | Change |
|-----------|--------|
| `OAuthButtons` | Accepts `signInWithGoogle` / `signInWithGitHub` props from web server actions |
| `WorkspaceSwitcher` | Accepts `switchWorkspace` callback prop |
| `WorkspaceSwitcherLoader` | Accepts `loadWorkspaces` + `switchWorkspace` props |

---

## Files Deleted from `apps/web`

```
components/auth/
components/rbac/
components/notifications/
components/org/
components/workspace/
app/globals.css
app/(protected)/admin/admin-shell.tsx
app/(protected)/notifications/notification-center-client.tsx
app/(protected)/settings/notifications/notification-preferences-client.tsx
```

---

## Configuration Updates

| File | Change |
|------|--------|
| `apps/web/package.json` | Added `@limbu/shared`, `@limbu/ui` |
| `apps/web/next.config.ts` | Added `@limbu/shared`, `@limbu/ui` to `transpilePackages` |
| `package.json` (root) | Added `typecheck:shared`, `typecheck:ui` scripts |
| `apps/web/app/layout.tsx` | Imports `@limbu/ui/styles/globals.css` + `@/lib/shared-config` |
| `apps/web/app/(auth)/layout.tsx` | Uses `AuthLayout` from `@limbu/ui` |

---

## Architecture After Phase 2

```
apps/web
  ├── UI pages & routes (thin wrappers)
  ├── lib/actions/* ("use server" — stays in web)
  ├── lib/shared-config.ts (auth bridge)
  └── lib/*/api.ts + session.ts (re-export adapters)

packages/ui
  ├── auth, rbac, notifications, layout components
  └── styles/globals.css

packages/shared
  ├── api (error mappers, API auth gates)
  ├── session (workspace/billing/analytics gates, web guards)
  ├── validators, types, errors, config
  └── Used by: apps/web, packages/ui, (future) apps/api

packages/* (domain)
  └── Business logic unchanged — services, access, domain errors
```

---

## Verification Results

| Target | Result |
|--------|--------|
| `@limbu/shared` typecheck | Pass |
| `@limbu/ui` typecheck | Pass |
| `@limbu/web` typecheck | Pass |

---

## Dependency Graph

```
@limbu/ui
  ├── @limbu/auth
  ├── @limbu/org
  ├── @limbu/workspace
  └── @limbu/shared

@limbu/shared
  ├── @limbu/auth, @limbu/db
  └── All domain packages (for isXError guards in API mappers)

@limbu/web
  ├── @limbu/ui
  └── @limbu/shared
```

---

## Out of Scope (Future Phases)

| Phase | Work |
|-------|------|
| Phase 3+ | Extract `apps/api` from web API routes |
| Phase 3+ | Extract `apps/admin` admin UI |
| Phase 3+ | Create `apps/mobile` |
| Follow-up | Move `components/chat/*` to `@limbu/ui/chat` or feature package |
| Follow-up | Consolidate domain package error classes to extend `@limbu/shared/errors` base |
| Follow-up | Consolidate duplicated `paginationSchema` in domain packages |
| Follow-up | Update API routes to import directly from `@limbu/shared` (remove lib adapters) |

---

## Conclusion

Phase 2 establishes the shared foundation (`@limbu/shared`) and reusable UI layer (`@limbu/ui`) required by the target monorepo architecture. The web app remains fully functional with updated imports; domain packages retain all business logic. Ready for Phase 3 (API extraction) when approved.
