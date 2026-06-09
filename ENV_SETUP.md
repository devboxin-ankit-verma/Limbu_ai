# Limbu Environment Setup Guide

Complete environment audit for the Limbu monorepo. Generated from static analysis of `process.env`, Prisma schema, Auth.js, Next.js public env, Docker Compose, and existing `.env.example` files.

**Scope:** `apps/web`, `apps/admin`, `apps/api`, `apps/worker`, `packages/*`  
**Note:** `apps/mobile` does not exist. Legacy Flutter config lives in `monorepo/app-flutter/`.

---

## GMB Integration Variables

| Variable | Required | Notes |
|----------|----------|-------|
| `INTEGRATION_MOCK_GOOGLE` | Local dev | Set `true` to use mock Google Business Profile without OAuth credentials |
| `GOOGLE_BUSINESS_CLIENT_ID` | Production | Google Cloud OAuth client ID |
| `GOOGLE_BUSINESS_CLIENT_SECRET` | Production | Google Cloud OAuth client secret |
| `GOOGLE_BUSINESS_REDIRECT_URI` | Yes | Must be `http://localhost:3002/api/integrations/google/callback` locally |
| `INTEGRATION_CREDENTIAL_ENCRYPTION_KEY` | Production | 64-char hex string (32 bytes) for AES-256-GCM credential encryption |

## Quick Start

| App | Port | Copy template | Run |
|-----|------|---------------|-----|
| Web | 3000 | `apps/web/.env.local.example` → `.env.local` | `npm run dev:web` |
| API | 3002 | `apps/api/.env.example` → `.env.local` | `npm run dev:api` |
| Admin | 3003 | `apps/admin/.env.local.example` → `.env.local` | `npm run dev:admin` |
| Worker | 3001 | `apps/worker/.env.example` → `.env` | `npm run dev:worker` |
| DB migrations | — | `packages/db/.env.example` → `.env` | `npm run db:generate` |

Local infrastructure:

```bash
cd infrastructure/docker
docker compose --profile local up -d postgres mailpit
docker compose up -d qdrant   # if using local Qdrant (not in compose — install separately or use cloud)
```

---

## Where Variables Are Stored

| Location | Purpose |
|----------|---------|
| `.env.example` (repo root) | Master catalog — reference only, not loaded by apps |
| `apps/web/.env.local` | Web app runtime (Next.js loads automatically) |
| `apps/admin/.env.local` | Admin console runtime |
| `apps/api/.env.local` | API service runtime |
| `apps/worker/.env` | Worker process (tsx, no Next.js) |
| `packages/db/.env` | Prisma CLI (`migrate`, `generate`, scripts) |
| Platform secrets (Vercel/Railway/Fly) | Production per-service env injection |

---

## Shared Variables (must match across services)

| Variable | Must match across | Why |
|----------|-------------------|-----|
| `DATABASE_URL` | web, api, admin, worker, packages/db | Single PostgreSQL database |
| `DIRECT_URL` | web, api, admin, packages/db | Prisma migrations |
| `AUTH_SECRET` | web, api, admin | JWT/session signing — mismatch breaks login |
| `WORKFLOW_WORKER_SECRET` | api, worker | Worker HTTP auth |
| `RAG_WORKER_SECRET` | api, worker | Worker HTTP auth |
| `NOTIFICATION_WORKER_SECRET` | api, worker | Worker HTTP auth |

## Per-App URL Variables (must NOT match)

| Variable | web | admin | api |
|----------|-----|-------|-----|
| `NEXTAUTH_URL` | `http://localhost:3000` | `http://localhost:3003` | `http://localhost:3000` (web origin) |

---

## Never Expose to Frontend

These must **never** use the `NEXT_PUBLIC_` prefix or appear in client bundles:

| Category | Variables |
|----------|-----------|
| Database | `DATABASE_URL`, `DIRECT_URL` |
| Auth | `AUTH_SECRET`, `AUTH_*_SECRET`, OAuth client secrets |
| AI | `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_AI_API_KEY`, `GEMINI_API_KEY` |
| Vector DB | `QDRANT_API_KEY` |
| Billing | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, all `STRIPE_PRICE_*` |
| Email | `SMTP_USER`, `SMTP_PASS` |
| Workers | `WORKFLOW_WORKER_SECRET`, `RAG_WORKER_SECRET`, `NOTIFICATION_WORKER_SECRET` |
| Push | `VAPID_PRIVATE_KEY` |

**Safe for frontend (`NEXT_PUBLIC_*`):**

| Variable | Used by |
|----------|---------|
| `NEXT_PUBLIC_ADMIN_APP_URL` | `apps/web` dashboard super-admin link |
| `NEXT_PUBLIC_WEB_APP_URL` | `apps/admin` "back to app" link |

---

## Complete Variable Audit

### Database

| Variable | Required | Used By | File Path | Purpose | Example | Dev | Production |
|----------|----------|---------|-----------|---------|---------|-----|------------|
| `DATABASE_URL` | **Required** | web, api, admin, worker, packages/db | `packages/db/prisma/schema.prisma`, `packages/db/src/client.ts` | Pooled PostgreSQL connection for Prisma runtime | `postgresql://user:pass@host/db?sslmode=require` | `postgresql://limbu:limbu@localhost:5433/limbu` | Neon pooled URL |
| `DIRECT_URL` | Required for migrations | web, api, admin, packages/db | `packages/db/prisma/schema.prisma`, `packages/db/scripts/*.ts` | Direct connection for Prisma Migrate | Same format, non-pooler host | Same as DATABASE_URL locally | Neon direct URL |
| `NODE_ENV` | Optional | web, api, admin, packages/db | `packages/db/src/client.ts`, `apps/*/auth.ts` | Prisma logging, secure cookies | `development` | `development` | `production` |

### Auth.js / NextAuth v5

| Variable | Required | Used By | File Path | Purpose | Example | Dev | Production |
|----------|----------|---------|-----------|---------|---------|-----|------------|
| `AUTH_SECRET` | **Required (prod)** | web, api, admin | Auth.js framework (implicit) | Session/JWT signing | `openssl rand -base64 32` | `limbu-dev-secret-change-in-production-32chars` | 32+ byte random secret |
| `NEXTAUTH_URL` | **Required (prod)** | web, api, admin, packages/auth, packages/org, packages/billing | `packages/auth/src/email.ts`, `packages/org/src/email.ts`, `packages/billing/src/config.ts` | Canonical app URL for emails, Stripe redirects | `https://app.limbu.ai` | web: `:3000`, admin: `:3003` | Per-app public URL |
| `AUTH_URL` | Optional | Auth.js framework | `@auth/core` (implicit) | Alias for `NEXTAUTH_URL` | `https://app.limbu.ai` | — | Same as NEXTAUTH_URL |
| `AUTH_TRUST_HOST` | Optional | web, api, admin | Documented only; `auth.config.ts` sets `trustHost: true` | Auth.js host header trust | `true` | `true` | `true` |
| `AUTH_GOOGLE_ID` | Optional | web, api, admin | `apps/web/auth.ts`, `apps/api/auth.ts`, `apps/admin/auth.ts` | Google OAuth client ID | `xxx.apps.googleusercontent.com` | Empty (credentials login works) | Google Cloud Console |
| `AUTH_GOOGLE_SECRET` | Optional | web, api, admin | Same as above | Google OAuth secret | `GOCSPX-...` | Empty | Google Cloud Console |
| `AUTH_GITHUB_ID` | Optional | web, api, admin | Same as above | GitHub OAuth app ID | `Ov23li...` | Empty | GitHub Developer Settings |
| `AUTH_GITHUB_SECRET` | Optional | web, api, admin | Same as above | GitHub OAuth secret | `ghp_...` | Empty | GitHub Developer Settings |

### Inter-Service URLs

| Variable | Required | Used By | File Path | Purpose | Example | Dev | Production |
|----------|----------|---------|-----------|---------|---------|-----|------------|
| `API_URL` | Optional | web, admin, packages/shared | `apps/web/next.config.ts`, `apps/web/app/api/[...path]/route.ts`, `apps/admin/app/api/admin/[...path]/route.ts`, `packages/shared/src/api/admin-client.ts` | Backend API base URL | `http://localhost:3002` | `http://localhost:3002` | `https://api.limbu.ai` |
| `API_INTERNAL_URL` | Optional | web, admin, packages/shared | Same files (fallback) | Internal network alias for API_URL | Same as API_URL | Same | Internal service URL |
| `NEXT_PUBLIC_ADMIN_APP_URL` | Optional | web | `apps/web/app/(protected)/dashboard/page.tsx` | Super-admin console link (client) | `http://localhost:3003` | `http://localhost:3003` | `https://admin.limbu.ai` |
| `NEXT_PUBLIC_WEB_APP_URL` | Optional | admin | `apps/admin/app/(console)/layout.tsx` | "Back to app" link (client) | `http://localhost:3000` | `http://localhost:3000` | `https://app.limbu.ai` |
| `API_PORT` | Optional (unused) | — | `apps/api/.env.example` only | Documented port; hardcoded in `package.json` | `3002` | `3002` | `3002` |

### AI Providers (`packages/ai-core`)

| Variable | Required | Used By | File Path | Purpose | Example | Dev | Production |
|----------|----------|---------|-----------|---------|---------|-----|------------|
| `OPENAI_API_KEY` | Required for OpenAI models + RAG | web, api, worker, packages/ai-core, packages/rag | `packages/ai-core/src/config.ts`, `packages/rag/src/embedding/service.ts` | OpenAI chat + embeddings | `sk-...` | Empty (chat/RAG fail) | Platform secret |
| `ANTHROPIC_API_KEY` | Required when Claude used | web, api, worker, packages/ai-core | `packages/ai-core/src/config.ts` | Anthropic Claude models | `sk-ant-...` | Empty | Platform secret |
| `GOOGLE_AI_API_KEY` | Required when Gemini used | web, api, worker, packages/ai-core | `packages/ai-core/src/config.ts` | Google Gemini models | `AIza...` | Empty | Google AI Studio |
| `GEMINI_API_KEY` | Optional alias | web, api, packages/ai-core | `packages/ai-core/src/config.ts` | Fallback for `GOOGLE_AI_API_KEY` | Same as above | — | Same |

### RAG / Qdrant (`packages/rag`)

| Variable | Required | Used By | File Path | Purpose | Example | Dev | Production |
|----------|----------|---------|-----------|---------|---------|-----|------------|
| `QDRANT_URL` | Optional | web, api, worker, packages/rag | `packages/rag/src/config.ts` | Qdrant HTTP endpoint | `http://127.0.0.1:6333` | Local Qdrant | Qdrant Cloud URL |
| `QDRANT_API_KEY` | Optional | web, api, worker, packages/rag | `packages/rag/src/vector/qdrant.ts` | Qdrant auth key | `...` | Empty (local) | Cloud API key |
| `QDRANT_COLLECTION` | Optional | web, api, worker, packages/rag | `packages/rag/src/config.ts` | Vector collection name | `limbu_knowledge` | Default | Same |
| `RAG_UPLOAD_DIR` | Optional | web, api, worker, packages/rag | `packages/rag/src/config.ts` | Local file upload path | `.uploads/knowledge` | Default | Persistent volume path |
| `RAG_EMBEDDING_MODEL` | Optional | web, api, worker, packages/rag | `packages/rag/src/config.ts` | OpenAI embedding model | `text-embedding-3-small` | Default | Default or upgraded |
| `RAG_CHUNK_SIZE` | Optional | web, api, packages/rag | `packages/rag/src/config.ts` | Document chunk size | `1000` | Default | Default |
| `RAG_CHUNK_OVERLAP` | Optional | web, api, packages/rag | `packages/rag/src/config.ts` | Chunk overlap | `200` | Default | Default |
| `RAG_MAX_FILE_SIZE_MB` | Optional | web, api, packages/rag | `packages/rag/src/config.ts` | Max upload size | `25` | Default | Default |
| `RAG_WORKER_SECRET` | Optional (required prod) | api, worker, packages/rag | `packages/rag/src/ingest/worker.ts` | Worker endpoint auth | Random string | `dev-rag-secret` | Strong random secret |
| `RAG_WORKER_BATCH_SIZE` | Optional | api, worker, packages/rag | `packages/rag/src/config.ts` | Jobs per batch | `5` | Default | Tune for load |

### Workflows (`packages/workflows`)

| Variable | Required | Used By | File Path | Purpose | Example | Dev | Production |
|----------|----------|---------|-----------|---------|---------|-----|------------|
| `WORKFLOW_WORKER_SECRET` | Optional (required prod) | api, worker, packages/workflows | `packages/workflows/src/access.ts` | Worker endpoint auth | Random string | `dev-workflow-secret` | Strong random secret |
| `WORKFLOW_WORKER_BATCH_SIZE` | Optional | api, worker, packages/workflows | `packages/workflows/src/config.ts` | Jobs per batch | `10` | Default | Tune for load |
| `WORKFLOW_MAX_LOOP_ITERATIONS` | Optional | api, packages/workflows | `packages/workflows/src/config.ts` | Loop safety cap | `100` | Default | Default |

### Billing / Stripe (`packages/billing`)

| Variable | Required | Used By | File Path | Purpose | Example | Dev | Production |
|----------|----------|---------|-----------|---------|---------|-----|------------|
| `STRIPE_SECRET_KEY` | Required (unless mock) | web, api, packages/billing | `packages/billing/src/config.ts` | Stripe API secret | `sk_live_...` | Empty + mock | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Required (unless mock) | api, packages/billing | `packages/billing/src/stripe/webhooks.ts` | Webhook signature verification | `whsec_...` | Empty + mock | Stripe Dashboard |
| `BILLING_MOCK_STRIPE` | Optional | web, api, packages/billing | `packages/billing/src/config.ts` | Skip real Stripe calls | `false` | `true` | `false` |
| `BILLING_DEFAULT_TRIAL_DAYS` | Optional | web, api, packages/billing | `packages/billing/src/config.ts` | Trial period length | `14` | `14` | `14` |
| `STRIPE_PRICE_{TIER}_{INTERVAL}` | Required per plan (unless mock) | web, api, packages/billing | `packages/billing/src/config.ts` | Stripe Price IDs | `price_...` | Empty + mock | Stripe Dashboard |

Tiers: `STARTER`, `PRO`, `TEAM`, `ENTERPRISE`. Intervals: `MONTHLY`, `ANNUAL`.

### Email / SMTP (`packages/notifications`)

| Variable | Required | Used By | File Path | Purpose | Example | Dev | Production |
|----------|----------|---------|-----------|---------|---------|-----|------------|
| `SMTP_HOST` | Optional | web, api, worker, packages/notifications | `packages/notifications/src/providers/smtp.ts` | SMTP server | `smtp.sendgrid.net` | `localhost` (Mailpit) | Provider host |
| `SMTP_PORT` | Optional | Same | Same | SMTP port | `587` | `1025` | `587` |
| `SMTP_SECURE` | Optional | Same | Same | TLS enabled | `true` | `false` | `true` |
| `SMTP_USER` | Optional | Same | Same | SMTP username | `apikey` | Empty | Provider creds |
| `SMTP_PASS` | Optional | Same | Same | SMTP password | `SG....` | Empty | Provider creds |
| `EMAIL_FROM` | Optional | Same | Same | From header | `Limbu <noreply@limbu.ai>` | Default | Verified sender |
| `NOTIFICATION_MOCK_EMAIL` | Optional | web, api, worker, packages/notifications | `packages/notifications/src/config.ts` | Log emails instead of send | `false` | `false` | `false` |
| `NOTIFICATION_MOCK_PUSH` | Optional | Same | Same | Skip web push delivery | `false` | `true` | `false` |
| `NOTIFICATION_WORKER_SECRET` | Optional (required prod) | api, worker, packages/notifications | `packages/notifications/src/access.ts` | Worker endpoint auth | Random string | `dev-notification-secret` | Strong random secret |
| `NOTIFICATION_WORKER_BATCH_SIZE` | Optional | api, worker, packages/notifications | `packages/notifications/src/config.ts` | Jobs per batch | `25` | Default | Tune for load |
| `VAPID_PUBLIC_KEY` | Optional | web, api, packages/notifications | `packages/notifications/src/providers/push.ts` | Web Push public key | Base64 key | Empty | Generated key pair |
| `VAPID_PRIVATE_KEY` | Optional | Same | Same | Web Push private key | Base64 key | Empty | Generated key pair |
| `VAPID_SUBJECT` | Optional | Same | Same | VAPID subject URI | `mailto:support@limbu.ai` | Default | Support email |

### Background Worker (`apps/worker`)

| Variable | Required | Used By | File Path | Purpose | Example | Dev | Production |
|----------|----------|---------|-----------|---------|---------|-----|------------|
| `WORKER_PORT` | Optional | worker | `apps/worker/src/config.ts` | HTTP server port | `3001` | `3001` | Platform-assigned |
| `WORKER_POLL_INTERVAL_MS` | Optional | worker | `apps/worker/src/config.ts` | Poll loop interval | `5000` | Default | Tune for load |
| `WORKER_POLL_ENABLED` | Optional | worker | `apps/worker/src/config.ts` | Enable background polling | `true` | `true` | `true` |

### Packages with no env vars

| Package | Notes |
|---------|-------|
| `packages/auth` | Uses `NEXTAUTH_URL` only (see Auth section) |
| `packages/agents` | Hardcoded config in `packages/agents/src/config.ts` |
| `packages/analytics` | No `process.env` usage |
| `packages/chat`, `packages/workspace`, `packages/org` (except email URL) | Minimal / inherited |

### Infrastructure (Docker Compose — not wired to app code)

| Variable | Service | Purpose |
|----------|---------|---------|
| `POSTGRES_USER/PASSWORD/DB` | postgres | Local DB (`limbu/limbu/limbu` on port 5433) |
| `MINIO_ROOT_USER/PASSWORD` | minio | S3-compatible storage — **not used by Limbu apps yet** |
| Redis (no env in app) | redis | **Not used by Limbu apps yet** |

### Not found in Limbu codebase

| Integration | Status |
|-------------|--------|
| Redis | Docker only; no app references |
| MinIO / S3 | Docker only; org logos use local filesystem (`apps/api/lib/org/logo.ts`) |
| Pinecone | Not referenced |
| Resend | Not referenced (SMTP via nodemailer) |
| PostgreSQL | Via Prisma `DATABASE_URL` |

### Legacy / out of scope (`monorepo/`)

| App | Key variables |
|-----|---------------|
| `monorepo/app-flutter` | `API_BASE_URL`, `APP_ENV`, `APP_NAME`, `APP_VERSION`, `RAZORPAY_KEY_ID` |
| `monorepo/backend-node` | MySQL (`DB_*`), JWT (`JWT_SECRET`), Razorpay, CORS |
| `monorepo/frontend-react` | `VITE_API_BASE_URL`, `VITE_APP_NAME` |

### Planned: `apps/mobile`

**Does not exist.** When added, expect: `API_URL`, Auth tokens, push notification keys, and `NEXT_PUBLIC_*` app config mirroring web patterns.

---

## Feature → Required Variables

| Feature | Minimum variables | Blocker if missing |
|---------|-------------------|-------------------|
| App boot | `DATABASE_URL` | Prisma cannot connect |
| Login (credentials) | `DATABASE_URL`, `AUTH_SECRET` | Session signing fails |
| Auth.js (production) | + `NEXTAUTH_URL` per app | Broken callbacks/redirects |
| OAuth login | + `AUTH_GOOGLE_*` or `AUTH_GITHUB_*` | Provider buttons fail silently |
| API requests (web → api) | `API_URL`, api running with same `AUTH_SECRET` | Proxy 502 / auth errors |
| AI chat | ≥1 of `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_AI_API_KEY` | `ProviderNotConfiguredError` |
| RAG ingest/search | `OPENAI_API_KEY`, reachable `QDRANT_URL` | `RagConfigError` |
| Billing (real) | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_*` | Checkout/webhook errors |
| Billing (local) | `BILLING_MOCK_STRIPE=true` | — |
| Email sending | `SMTP_*` or Mailpit on `:1025` | Connection refused |
| Email (skip) | `NOTIFICATION_MOCK_EMAIL=true` | — |
| Background workers | `DATABASE_URL`, matching `*_WORKER_SECRET` | Jobs stall or 401 |
| File uploads (org logos) | API filesystem write access | No env var — uses `public/uploads/` |
| Web push | `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` | Push silently skipped |

---

## Recommended Local `.env` Checklist

```bash
# 1. Database
cp packages/db/.env.local.example packages/db/.env

# 2. Apps
cp apps/web/.env.local.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env.local
cp apps/admin/.env.local.example apps/admin/.env.local
cp apps/worker/.env.example apps/worker/.env

# 3. Start infra
cd infrastructure/docker && docker compose --profile local up -d postgres mailpit

# 4. Migrate
npm run db:generate

# 5. Run (4 terminals)
npm run dev:web
npm run dev:api
npm run dev:admin
npm run dev:worker
```

---

## Related Files

| File | Role |
|------|------|
| `.env.example` | Master catalog |
| `ENVIRONMENT_READINESS_REPORT.md` | Gaps, security, readiness score |
| `apps/web/.env.example` | Production web template (unchanged) |
| `infrastructure/docker/docker-compose.yml` | Local Postgres, Mailpit, Redis, MinIO |
