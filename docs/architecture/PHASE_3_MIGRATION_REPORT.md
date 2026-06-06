# Phase 3 Migration Report — API Extraction

**Date:** 2026-06-05  
**Scope:** Phase 3 only (`apps/api` extraction)  
**Status:** Complete

---

## Executive Summary

Phase 3 extracts all REST API route handlers from `apps/web` into a dedicated `@limbu/api` Next.js service. The web app no longer implements business API logic — it proxies `/api/*` requests (except NextAuth) to `@limbu/api` while preserving the same public URLs (`/api/chat/threads`, etc.).

Authentication, RBAC, multi-tenancy, billing, and AI integrations are unchanged at the behavior level. Session cookies remain on the web origin; the proxy forwards them to the API service.

---

## What Was Created

### `apps/api` (`@limbu/api`)

| Area | Details |
|------|---------|
| **Port** | 3002 (dev/start) |
| **Routes** | 84 route handlers moved from `apps/web/app/api/*` |
| **Auth** | `auth.ts`, `auth.config.ts` (shared session via `@limbu/shared/session`) |
| **Infra** | `lib/shared-config.ts`, `lib/org/logo.ts`, `types/next-auth.d.ts` |
| **Static** | `public/uploads/` for org logo assets |

### `@limbu/shared` additions

| Module | Contents |
|--------|----------|
| `middleware/` | `PROTECTED_PAGE_PREFIXES`, `authPages`, `forbiddenRedirectUrl` — shared between web UI middleware and auth config |

### API route imports

All moved routes now import directly from `@limbu/shared/api` and `@limbu/shared/session` instead of `apps/web/lib/*/api.ts`.

---

## What Moved

| Source | Destination |
|--------|-------------|
| `apps/web/app/api/**` (84 routes) | `apps/api/app/api/**` |
| `apps/web/lib/*/api.ts` (10 adapters) | Removed — routes use `@limbu/shared/api` |
| `apps/web/lib/*/session.ts` (6 adapters) | Removed — routes use `@limbu/shared/session` |
| `apps/web/lib/org/logo.ts` (API usage) | `apps/api/lib/org/logo.ts` (web keeps copy for server actions) |
| Middleware constants | `packages/shared/src/middleware/` |

### What stayed in `apps/web`

| Path | Reason |
|------|--------|
| `app/api/auth/[...nextauth]/route.ts` | NextAuth session cookies must be issued on web origin |
| `app/api/[...path]/route.ts` | Reverse proxy to `@limbu/api` |
| `middleware.ts` | UI route protection (not API) |
| `auth.ts`, `auth.config.ts` | Web session + server actions |
| `lib/session.ts`, `lib/rbac/guards.ts` | Page-level guards |
| `lib/chat/client.ts` | Browser fetch to `/api/*` (proxied) |

---

## Architecture After Phase 3

```
Browser
  │
  ▼
apps/web :3000
  ├── /api/auth/*          → NextAuth (local)
  ├── /api/*               → proxy → apps/api :3002
  ├── /uploads/*           → rewrite → apps/api/public
  └── UI pages             → @limbu/ui, server actions

apps/api :3002
  ├── /api/*               → 84 route handlers
  ├── auth()               → reads session cookie (same AUTH_SECRET)
  └── @limbu/shared        → session gates, error mappers

packages/*                 → domain business logic (unchanged)
apps/worker :3001          → background jobs (unchanged)
```

### Request flow (example: chat)

1. Browser: `fetch("/api/chat/threads")` → web :3000
2. Web proxy: forwards cookies + body → api :3002/api/chat/threads
3. API route: `requireChatSession()` → `@limbu/shared/session` → `@limbu/auth`
4. Domain: `@limbu/chat` service executes
5. Response proxied back to browser

---

## Environment Variables

| Variable | Default | Used by |
|----------|---------|---------|
| `API_URL` | `http://localhost:3002` | Web proxy + uploads rewrite |
| `API_INTERNAL_URL` | same as `API_URL` | Web proxy fallback |
| `AUTH_SECRET` | — | **Must match** between web and api |
| `NEXTAUTH_URL` | `http://localhost:3000` | Web (cookie domain) |
| `DATABASE_URL` | — | Shared by web, api, worker |

See `apps/api/.env.example` and updated `apps/web/.env.example`.

---

## How to Run

```bash
# Terminal 1 — API service (required for /api/*)
npm run dev:api

# Terminal 2 — Web UI
npm run dev:web

# Terminal 3 — Worker (optional)
npm run dev:worker
```

Production: deploy `@limbu/api` separately; set `API_URL` on web to the internal API service URL.

---

## Verification Results

| Target | Result |
|--------|--------|
| `@limbu/shared` typecheck | Pass |
| `@limbu/api` typecheck | Pass |
| `@limbu/web` typecheck | Pass |

---

## Files Deleted from `apps/web`

```
app/api/** (84 route directories — replaced by proxy)
lib/workflows/api.ts, session.ts
lib/agents/api.ts, session.ts
lib/rag/api.ts, session.ts
lib/chat/api.ts, session.ts
lib/billing/api.ts, session.ts
lib/analytics/api.ts, session.ts
lib/org/api.ts
lib/workspace/api.ts
lib/notifications/api.ts
lib/admin/api.ts
```

---

## Preserved Integrations

| Concern | How preserved |
|---------|---------------|
| **Authentication** | Same `AUTH_SECRET`, JWT session, cookie forwarded via proxy |
| **RBAC** | `@limbu/auth/rbac` + `@limbu/shared/session` gates in API routes |
| **Multi-tenancy** | Org/workspace session fields unchanged |
| **Billing** | Stripe webhooks, checkout, portal routes in `@limbu/api` |
| **AI** | Chat SSE stream, agents, RAG, workflows in `@limbu/api` |
| **Workers** | Worker trigger routes (`/api/*/worker/process`) in `@limbu/api` |

---

## Out of Scope (Future Phases)

| Phase | Work |
|-------|------|
| Phase 4+ | Extract `apps/admin` UI |
| Phase 4+ | Create `apps/mobile` |
| Follow-up | Replace Next.js proxy with edge/API gateway in production |
| Follow-up | Consolidate duplicate `auth.ts` between web and api into `@limbu/auth` |
| Follow-up | Direct mobile/client calls to `API_URL` (skip web proxy) |

---

## Dependency Graph

```
@limbu/web
  ├── @limbu/ui, @limbu/shared (UI + proxy)
  └── HTTP proxy → @limbu/api

@limbu/api
  ├── @limbu/shared (api + session)
  ├── @limbu/worker (worker route imports)
  └── all domain packages

@limbu/shared
  └── middleware constants (web + api auth config)
```

---

## Conclusion

Phase 3 completes the three-tier split: **web (UI)**, **api (REST)**, **worker (jobs)**. The monorepo now matches the target architecture for backend extraction while keeping backward-compatible `/api/*` URLs for the web client. Ready for admin/mobile extraction when approved.
