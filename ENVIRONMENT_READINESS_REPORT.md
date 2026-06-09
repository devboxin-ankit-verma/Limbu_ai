# Environment Readiness Report

**Audit date:** 2026-06-06  
**Repository:** `gmb-automation` (Limbu monorepo)  
**Method:** Static scan of source, Prisma schema, Auth.js, Docker Compose, and `.env*` templates  
**Scope:** `apps/web`, `apps/admin`, `apps/api`, `apps/worker`, `packages/*`

---

## Executive Summary

| Metric | Score | Status |
|--------|-------|--------|
| **Production readiness** | **68 / 100** | ⚠️ Needs work before production |
| Variable documentation | 85 / 100 | Good after this audit |
| Secret hygiene | 55 / 100 | Worker auth bypass, weak dev secrets |
| Cross-service consistency | 70 / 100 | AUTH_SECRET rules documented; easy to misconfigure |
| Third-party coverage | 75 / 100 | AI/RAG/Stripe covered; Redis/S3 unused |

The monorepo has a solid foundation in `apps/web/.env.example` but had **gaps in api/worker templates**, **undocumented variables**, and **security defaults that must not ship to production**.

---

## Production Readiness Score Breakdown

| Area | Weight | Score | Notes |
|------|--------|-------|-------|
| Database | 15% | 90 | Prisma + Neon docs exist; local Docker documented |
| Authentication | 20% | 75 | AUTH_SECRET shared correctly; NEXTAUTH_URL per-app confusion risk |
| API layer | 15% | 65 | api `.env.example` was minimal (now expanded) |
| AI / RAG | 15% | 70 | Keys documented; no provider = hard failure at runtime |
| Billing | 10% | 60 | Mock flag works locally; Stripe Price IDs easy to miss |
| Workers | 10% | 55 | No `.env.example` existed; empty secrets = open endpoints |
| Email / notifications | 10% | 80 | Mailpit path clear; VAPID optional |
| Mobile | 5% | 0 | `apps/mobile` does not exist |

**Weighted total: 68 / 100**

---

## Missing Variables (would block features)

### Critical — blocks core functionality

| Variable | Affected apps | Impact | Resolution |
|----------|---------------|--------|------------|
| `DATABASE_URL` | All | App cannot start; Prisma fails | Set in every app + `packages/db/.env` |
| `AUTH_SECRET` | web, api, admin | Login/session invalid in production | Generate with `openssl rand -base64 32`; sync all apps |
| `NEXTAUTH_URL` | web, api, admin | Broken auth redirects, wrong email links | Set per-app origin (web `:3000`, admin `:3003`) |

### High — blocks specific features

| Variable | Feature blocked | When |
|----------|-----------------|------|
| `OPENAI_API_KEY` | RAG embeddings, OpenAI chat | Always for RAG; chat if OpenAI model selected |
| `ANTHROPIC_API_KEY` / `GOOGLE_AI_API_KEY` | Claude / Gemini chat | When those models are routed |
| `STRIPE_SECRET_KEY` | Real checkout | When `BILLING_MOCK_STRIPE=false` |
| `STRIPE_WEBHOOK_SECRET` | Subscription lifecycle | Stripe webhook route |
| `STRIPE_PRICE_*` | Paid plan checkout | Per tier/interval used |
| `SMTP_HOST` + reachable server | Email delivery | Unless Mailpit local or `NOTIFICATION_MOCK_EMAIL=true` |
| `*_WORKER_SECRET` (×3) | Secure worker endpoints | Production — empty allows unauthenticated job processing |

### Medium — degraded experience

| Variable | Impact |
|----------|--------|
| `QDRANT_URL` unreachable | RAG search/ingest fails (defaults to localhost) |
| `VAPID_*` missing | Web push disabled (graceful) |
| `AUTH_GOOGLE_*` / `AUTH_GITHUB_*` | OAuth buttons unavailable; credentials login still works |
| `API_URL` wrong | Web proxy to API fails (502) |

### Missing templates (before this audit)

| File | Status |
|------|--------|
| Root `.env.example` | ✅ Created |
| `apps/worker/.env.example` | ✅ Created |
| `apps/admin/.env.local.example` | ✅ Created |
| `apps/api/.env.example` | ✅ Expanded (was 11 lines, missing AI/billing/worker vars) |
| `apps/web/.env.local.example` | ✅ Expanded (was auth+SMTP only) |

---

## Invalid / Misleading Variables

| Variable | Issue | Recommendation |
|----------|-------|----------------|
| `API_PORT` | Documented in `apps/api/.env.example` but **never read in code**; port hardcoded in `package.json` (`--port 3002`) | Treat as documentation only; remove from runtime expectations |
| `AUTH_TRUST_HOST` | Listed in `.env.example` files but **not read** — apps use `trustHost: true` in `auth.config.ts` | Keep for Auth.js convention; no runtime effect today |
| `NEXTAUTH_URL` on api | Must be **web app URL** (`:3000`), not API URL (`:3002`) — easy misconfiguration | Documented in expanded templates |
| `GEMINI_API_KEY` | Duplicate alias for `GOOGLE_AI_API_KEY` | Set one; prefer `GOOGLE_AI_API_KEY` |
| `API_INTERNAL_URL` | Duplicate fallback for `API_URL` | Set `API_URL` only unless split internal/external routing needed |

---

## Duplicate Variables

| Variables | Relationship | Guidance |
|-----------|--------------|----------|
| `API_URL` / `API_INTERNAL_URL` | Identical fallback chain | Use `API_URL`; set `API_INTERNAL_URL` only for k8s internal DNS |
| `NEXTAUTH_URL` / `AUTH_URL` | Auth.js aliases | Prefer `NEXTAUTH_URL` |
| `GOOGLE_AI_API_KEY` / `GEMINI_API_KEY` | Same provider, alias in ai-core | Set one |
| `DATABASE_URL` in 5 places | Required copy | Must be identical across web, api, admin, worker, packages/db |
| `AUTH_SECRET` in 3 apps | Required copy | Must be identical |
| `*_WORKER_SECRET` in api + worker | Required pair | Must match per secret type |
| `OPENAI_API_KEY` in web, api, worker | Same key, multiple processes | Same value if all run AI/RAG jobs |

---

## Security Issues

### Critical

| Issue | Location | Risk | Mitigation |
|-------|----------|------|------------|
| Empty worker secrets allow all requests | `packages/workflows/src/access.ts`, `packages/rag/src/ingest/worker.ts`, `packages/notifications/src/access.ts` | Unauthenticated job execution if worker port exposed | Set strong `*_WORKER_SECRET` in production; firewall worker port |
| Dev `AUTH_SECRET` in examples | All `.env*.example` files | Credential theft if copied to production | Rotate before deploy; use secret manager |
| Stripe keys in same env as frontend apps | web loads billing package server-side | Low if no `NEXT_PUBLIC_` leak; verify no client import | Keep billing server-only |

### High

| Issue | Risk | Mitigation |
|-------|------|------------|
| `BILLING_MOCK_STRIPE=true` in local templates | Accidental production mock billing | Enforce `false` in prod CI check |
| OAuth secrets empty strings still register providers | Provider errors on sign-in attempt | Leave unset or disable providers in UI |
| Org logo uploads to local filesystem | No env-based storage; not S3 | Accept for MVP; plan object storage migration |
| Redis/MinIO in Docker but unused | False sense of dependency | Document as future infrastructure |

### Medium

| Issue | Risk | Mitigation |
|-------|------|------------|
| `NOTIFICATION_MOCK_PUSH=true` in dev | Push never tested locally | Generate VAPID keys for staging |
| Weak default SMTP (open Mailpit) | Email interception in shared dev networks | Mailpit localhost-only is fine for local |
| No `.env` validation at startup | Silent misconfiguration | Consider `zod` env schema (future; out of scope) |

### Frontend exposure audit

| Variable | Exposed? | Verdict |
|----------|----------|---------|
| `NEXT_PUBLIC_ADMIN_APP_URL` | Yes (web) | ✅ Safe — public URL |
| `NEXT_PUBLIC_WEB_APP_URL` | Yes (admin) | ✅ Safe — public URL |
| All secrets / API keys | No `NEXT_PUBLIC_` prefix found | ✅ Pass |

---

## Per-Application Readiness

### apps/web — 72 / 100

| Status | Item |
|--------|------|
| ✅ | Comprehensive `apps/web/.env.example` (production) |
| ✅ | `.env.local.example` expanded |
| ⚠️ | Transpiles many packages — inherits all their env requirements |
| ⚠️ | Proxies to API — requires api running with matching secrets |
| ❌ | No startup env validation |

### apps/admin — 70 / 100

| Status | Item |
|--------|------|
| ✅ | `.env.example` + new `.env.local.example` |
| ⚠️ | `NEXTAUTH_URL` must differ from web (port 3003) |
| ⚠️ | Minimal env — relies on API for admin data |
| ❌ | No OAuth env in local example (optional) |

### apps/api — 65 / 100

| Status | Item |
|--------|------|
| ✅ | `.env.example` now complete |
| ⚠️ | Was missing AI, billing, worker, notification vars |
| ⚠️ | Handles Stripe webhooks — needs public URL + `STRIPE_WEBHOOK_SECRET` |
| ❌ | `API_PORT` misleading |

### apps/worker — 58 / 100

| Status | Item |
|--------|------|
| ✅ | `.env.example` created |
| ⚠️ | Needs same AI/SMTP keys as api for job execution |
| ❌ | No health check env |
| ❌ | Empty worker secrets = open in dev |

### apps/mobile — N/A

**Not present in repository.** Legacy Flutter at `monorepo/app-flutter/` uses separate env (`API_BASE_URL`, `RAZORPAY_KEY_ID`).

### packages/db — 85 / 100

| Status | Item |
|--------|------|
| ✅ | `.env.example` + `.env.local.example` |
| ✅ | Prisma schema documents `DATABASE_URL`, `DIRECT_URL` |
| ⚠️ | Requires pgvector extension (Neon or local Docker image) |

### packages/auth — 90 / 100

Uses `NEXTAUTH_URL` only; RBAC has no env deps.

### packages/ai-core — 75 / 100

Requires at least one provider key for chat routing; throws at runtime if none configured.

### packages/rag — 70 / 100

`OPENAI_API_KEY` hard-required for embeddings; Qdrant defaults to localhost.

### packages/agents — 100 / 100 (env)

No environment variables — config is code-based.

### packages/workflows — 65 / 100

Worker secret optional in dev; batch/loop vars have sane defaults.

### packages/billing — 60 / 100

Eight `STRIPE_PRICE_*` vars easy to omit; mock flag essential for local dev.

### packages/analytics — 100 / 100 (env)

No environment variables.

---

## Blockers by User Journey

| Journey | Blockers if unset |
|---------|-------------------|
| **Login** | `DATABASE_URL`, `AUTH_SECRET` |
| **Auth.js session** | + matching secrets across web/api/admin |
| **Database connection** | `DATABASE_URL` (valid connection string) |
| **API requests (web UI)** | `API_URL`, api process running, shared `AUTH_SECRET` |
| **AI providers** | ≥1 provider API key |
| **Billing** | `STRIPE_*` or `BILLING_MOCK_STRIPE=true` |
| **Background workers** | `DATABASE_URL`, worker running, matching secrets |
| **Email sending** | SMTP or Mailpit; or mock flag |
| **File uploads** | API write access to `public/uploads/` (no env — filesystem) |

---

## Recommendations (priority order)

1. **Before staging:** Set all three `*_WORKER_SECRET` values; never deploy with empty secrets.
2. **Before production:** Rotate `AUTH_SECRET`; use platform secret manager (Vercel/Railway/etc.).
3. **Before production:** Set `BILLING_MOCK_STRIPE=false` and all Stripe Price IDs.
4. **CI check:** Fail build if required prod vars missing (schema validation — future work).
5. **Admin onboarding:** Add README pointer to `ENV_SETUP.md` in each app folder.
6. **Clarify api NEXTAUTH_URL:** Add comment in deployment docs — always web origin.
7. **Remove or implement `API_PORT`:** Either read in code or drop from examples.
8. **Mobile:** When `apps/mobile` is created, add `.env.example` following web patterns.

---

## Files Generated by This Audit

| File | Action |
|------|--------|
| `.env.example` | Created — master catalog |
| `apps/web/.env.local.example` | Updated — full local dev set |
| `apps/admin/.env.local.example` | Created |
| `apps/api/.env.example` | Expanded — all package vars |
| `apps/worker/.env.example` | Created |
| `ENV_SETUP.md` | Created — full variable audit |
| `ENVIRONMENT_READINESS_REPORT.md` | This file |

**No application code was modified.**

---

## Sign-Off Checklist for Production

- [ ] `DATABASE_URL` + `DIRECT_URL` (Neon) set in all services
- [ ] `AUTH_SECRET` rotated and synced (web, api, admin)
- [ ] `NEXTAUTH_URL` correct per app (web, admin) and web origin on api
- [ ] `WORKFLOW_WORKER_SECRET`, `RAG_WORKER_SECRET`, `NOTIFICATION_WORKER_SECRET` set
- [ ] Worker port not publicly exposed (internal network only)
- [ ] ≥1 AI provider key configured
- [ ] `OPENAI_API_KEY` set if RAG enabled
- [ ] `QDRANT_URL` + `QDRANT_API_KEY` (if cloud)
- [ ] `BILLING_MOCK_STRIPE=false`
- [ ] All required `STRIPE_PRICE_*` IDs set
- [ ] `STRIPE_WEBHOOK_SECRET` + webhook endpoint registered
- [ ] Production SMTP configured
- [ ] `VAPID_*` keys generated for web push
- [ ] No secrets in `NEXT_PUBLIC_*` variables
- [ ] `.env.local` / `.env` files in `.gitignore` (verify)
