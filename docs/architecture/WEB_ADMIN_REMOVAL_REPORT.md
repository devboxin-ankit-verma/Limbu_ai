# Web Admin Removal Report — Platform Management Cutover

**Date:** 2026-06-05  
**Scope:** Remove platform admin from `apps/web`; exclusive management via `apps/admin`  
**Status:** Complete

---

## Executive Summary

Platform administration has been fully removed from `@limbu/web`. The web app now focuses exclusively on user-facing product features. All platform management (users, organizations, workspaces, billing entitlements, subscriptions, audit, feature flags, health, analytics, AI usage) lives in `@limbu/admin-app` on port **3003**.

Super-admins retain a **Platform Admin** link on the dashboard that opens the standalone admin console.

---

## What Was Removed from `apps/web`

### Deleted routes (14 files)

Entire tree: `app/(protected)/admin/`

| Former route | Feature |
|--------------|---------|
| `/admin` | Dashboard |
| `/admin/users` | User Management |
| `/admin/organizations` | Organization Management |
| `/admin/subscriptions` | Subscription Management |
| `/admin/revenue` | Revenue |
| `/admin/billing` | Billing entitlements (platform) |
| `/admin/analytics` | Platform analytics |
| `/admin/audit` | Audit logs |
| `/admin/feature-flags` | Feature flags |
| `/admin/health` | System health |

### Removed dependencies

| Package | Reason |
|---------|--------|
| `@limbu/admin` | No longer imported by web (admin services consumed only by API) |

### Removed guards / exports

| Symbol | File |
|--------|------|
| `requirePlatformAccess()` | `lib/rbac/guards.ts` |
| Platform branch in `requireRouteAccess()` | `lib/rbac/guards.ts` |

---

## What Was Modified

| File | Change |
|------|--------|
| `app/(protected)/dashboard/page.tsx` | Replaced `/admin` link with external **Platform Admin** link (`NEXT_PUBLIC_ADMIN_APP_URL`) for super-admins only |
| `app/api/[...path]/route.ts` | Blocks `/api/admin/*` proxy — returns 404 on web origin |
| `package.json` | Removed `@limbu/admin` dependency |
| `next.config.ts` | Removed `@limbu/admin` from `transpilePackages` |
| `.env.example` | Added `NEXT_PUBLIC_ADMIN_APP_URL` |

### Shared package updates

| File | Change |
|------|--------|
| `packages/shared/src/middleware/protected-routes.ts` | Removed `"/admin"` from `PROTECTED_PAGE_PREFIXES` |
| `packages/auth/src/rbac/routes.ts` | Removed all `/admin/*` route rules |

---

## What Was Kept in `apps/web`

User-facing product areas are unchanged:

| Area | Routes |
|------|--------|
| **Chat** | `/chat`, `/chat/[threadId]` |
| **RAG / Knowledge** | `/knowledge` |
| **Agents** | `/agents` |
| **Workflows** | `/workflows`, `/workflows/[workflowId]`, runs |
| **Billing (org)** | `/organizations/[orgId]/billing` |
| **Analytics (org)** | `/organizations/[orgId]/analytics` |
| **Settings** | `/settings`, org/workspace settings |
| **Organizations & workspaces** | Full org/workspace/member flows |
| **Notifications** | `/notifications`, `/settings/notifications` |
| **Dashboard & auth** | `/dashboard`, login, register, invite |

Session still carries `isSuperAdmin` for org/workspace bypass and the dashboard admin link.

---

## Architecture After Cutover

```
apps/web :3000
  ├── User product UI only
  ├── /api/* (except admin) → proxy → apps/api :3002
  └── /api/admin/*          → 404 (blocked)

apps/admin :3003
  ├── Platform admin UI
  └── /api/admin/*          → proxy → apps/api :3002

apps/api :3002
  └── /api/admin/*          → @limbu/admin services
```

---

## Environment Variables

| Variable | Default | Used by |
|----------|---------|---------|
| `NEXT_PUBLIC_ADMIN_APP_URL` | `http://localhost:3003` | Web dashboard super-admin link |

See updated `apps/web/.env.example`.

---

## How to Run

```bash
npm run dev:web     # :3000 — user product
npm run dev:api     # :3002 — backend API
npm run dev:admin   # :3003 — platform admin
```

Super-admins: sign in to web → click **Platform Admin** on dashboard → admin console at `:3003`.

---

## Verification Results

| Target | Result |
|--------|--------|
| `@limbu/web` typecheck | Pass |
| `@limbu/shared` typecheck | Pass |

---

## Distinction: Platform vs Org Admin

| Concern | Web (`:3000`) | Admin app (`:3003`) |
|---------|---------------|---------------------|
| Org billing (Stripe checkout, portal) | ✅ `/organizations/.../billing` | — |
| Platform billing entitlements | — | ✅ `/billing` |
| Org analytics | ✅ `/organizations/.../analytics` | — |
| Platform analytics / AI usage | — | ✅ `/analytics`, `/ai-usage` |
| User/org/workspace CRUD (platform) | — | ✅ admin routes |

---

## Conclusion

`apps/web` is now optimized as a **product-only** frontend. Platform management is exclusively in `apps/admin`, with API access hardened so the web origin cannot proxy admin endpoints. This completes the Phase 4 admin extraction cutover.
