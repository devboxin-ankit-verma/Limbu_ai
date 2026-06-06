# Phase 4 Migration Report — Admin Console Extraction

**Date:** 2026-06-05  
**Scope:** Phase 4 only (`apps/admin` extraction)  
**Status:** Complete

---

## Executive Summary

Phase 4 introduces a standalone **Platform Admin** console at `apps/admin` (`@limbu/admin-app`, port **3003**). The admin UI is decoupled from `apps/web` while reusing shared packages for layout, auth, billing, analytics, and domain services. All admin data mutations and reads go through `apps/api` via a same-origin proxy — no business logic is duplicated in the admin app.

`apps/web` was **not modified** in this phase. The existing `/admin/*` routes in web remain available in parallel until a future cutover.

---

## What Was Created

### `apps/admin` (`@limbu/admin-app`)

| Area | Details |
|------|---------|
| **Port** | 3003 (dev/start) |
| **Auth** | NextAuth on admin origin (`auth.ts`, `auth.config.ts`) — super-admin credentials login |
| **Proxy** | `app/api/admin/[...path]/route.ts` → `API_URL/api/admin/*` with cookie forwarding |
| **Session** | `@limbu/shared/session` + `lib/rbac/guards.ts` (`requirePlatformAccess`) |
| **API client** | `adminApi()` from `@limbu/shared/api` (browser → admin proxy → api) |

### Admin feature pages (13 routes)

| Route | Feature |
|-------|---------|
| `/` | Dashboard |
| `/users` | User Management |
| `/organizations` | Organization Management |
| `/workspaces` | Workspace Management (**new page**) |
| `/subscriptions` | Subscription Management |
| `/revenue` | Revenue |
| `/billing` | Billing Management (entitlements) |
| `/audit` | Audit Logs |
| `/feature-flags` | Feature Flags |
| `/health` | System Health |
| `/analytics` | Analytics Dashboard |
| `/ai-usage` | AI Usage Dashboard (**new page**) |
| `/login` | Admin login (credentials) |

### `apps/api` addition

| Route | Service |
|-------|---------|
| `GET /api/admin/workspaces` | `@limbu/admin` → `listWorkspaces()` |

### `@limbu/shared` addition

| Module | Contents |
|--------|----------|
| `api/admin-client.ts` | `adminApi()`, `adminFetch()`, `readApiError()` |

### `@limbu/admin` addition

| Module | Contents |
|--------|----------|
| `services/workspaces.service.ts` | `listWorkspaces()` |
| `types.ts` | `AdminWorkspaceSummary` |

### `@limbu/ui` update

| Component | Change |
|-----------|--------|
| `AdminShell` | Optional `basePath`, `backHref`, `backLabel`; expanded nav (workspaces, billing, ai-usage). Defaults preserve web `/admin/*` behavior. |

---

## Architecture After Phase 4

```
Browser (admin)
  │
  ▼
apps/admin :3003
  ├── /login                 → credentials login (local NextAuth)
  ├── /api/auth/*            → NextAuth (admin origin cookies)
  ├── /api/admin/*           → proxy → apps/api :3002/api/admin/*
  └── /* (console pages)     → @limbu/ui AdminShell + adminApi()

apps/api :3002
  └── /api/admin/*           → @limbu/admin services (unchanged + workspaces)

apps/web :3000               → unchanged (still has /admin/* UI)
```

### Request flow (example: list users)

1. Browser: `adminApi("/users")` → admin :3003 `/api/admin/users`
2. Admin proxy: forwards session cookie → api :3002 `/api/admin/users`
3. API route: `requireAdminApi()` → `@limbu/admin` → `listUsers()`
4. Response proxied back to browser

---

## Package Reuse (no duplicated business logic)

| Package | Used for |
|---------|----------|
| `@limbu/ui` | `AdminShell`, auth form components, table styles, `globals.css` |
| `@limbu/shared` | Session bridge, RBAC guards, `adminApi`, validators, types |
| `@limbu/auth` | Credentials auth, tenant context, RBAC permissions |
| `@limbu/billing` | Entitlements (via API routes) |
| `@limbu/analytics` | Platform overview + AI usage (via API routes) |
| `@limbu/admin` | All admin domain services (consumed by API, not admin UI directly) |

---

## Environment Variables

| Variable | Default | Used by |
|----------|---------|---------|
| `API_URL` | `http://localhost:3002` | Admin proxy to API |
| `AUTH_SECRET` | — | **Must match** web, api, and admin |
| `NEXTAUTH_URL` | `http://localhost:3003` | Admin (cookie origin) |
| `NEXT_PUBLIC_WEB_APP_URL` | `http://localhost:3000` | AdminShell “Back to app” link |
| `DATABASE_URL` | — | Admin auth (credentials login) |

See `apps/admin/.env.example`.

---

## How to Run

```bash
# Terminal 1 — API (required)
npm run dev:api

# Terminal 2 — Admin console
npm run dev:admin

# Terminal 3 — Web (optional — main product)
npm run dev:web
```

Open **http://localhost:3003** and sign in with a super-admin account.

---

## Verification Results

| Target | Result |
|--------|--------|
| `@limbu/admin-app` typecheck | Pass |
| `@limbu/ui` typecheck | Pass |
| `@limbu/admin` typecheck | Pass |
| `@limbu/api` typecheck | Pass |
| `@limbu/shared` typecheck | Pass |

---

## Files Added / Changed

### New app tree

```
apps/admin/
  app/(console)/          # 13 protected admin pages
  app/api/admin/[...path]/ # proxy to API
  app/api/auth/[...nextauth]/
  app/login/
  auth.ts, auth.config.ts
  lib/actions/auth.ts
  lib/api.ts, lib/rbac/, lib/session.ts
  middleware.ts
  .env.example
```

### Modified (non-web)

```
apps/api/app/api/admin/workspaces/route.ts   # NEW
packages/admin/src/services/workspaces.service.ts
packages/shared/src/api/admin-client.ts
packages/ui/src/layout/admin/admin-shell.tsx
package.json                                 # dev:admin, typecheck:admin
```

### Not modified

```
apps/web/**                                  # per Phase 4 constraint
apps/mobile/**                               # out of scope
```

---

## Out of Scope (Future Phases)

| Phase | Work |
|-------|------|
| Phase 5+ | Create `apps/mobile` |
| Follow-up | Remove `/admin/*` from `apps/web` after admin cutover |
| Follow-up | Dedicated `/api/admin/ai-usage` route (currently uses analytics overview) |
| Follow-up | OAuth on admin login (optional) |
| Follow-up | Consolidate shared `auth.ts` across web/api/admin |

---

## Conclusion

Phase 4 completes the **admin console extraction**: a dedicated `@limbu/admin-app` service on port 3003 that reuses shared UI and domain packages while consuming all admin operations through `@limbu/api`. The monorepo now has four deployable apps — **web**, **api**, **worker**, and **admin** — with clear separation of concerns and no duplicated business logic in the admin layer.
