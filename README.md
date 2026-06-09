# Limbu — AI GMB Marketing Automation

Multi-tenant SaaS platform for Google Business Profile automation: AI post generation, smart scheduling, review management, and local SEO analytics.

**Live product reference:** [limbu.ai](https://www.limbu.ai)

## Monorepo Structure

| App | Port | Role |
|-----|------|------|
| `apps/web` | 3000 | User-facing app (marketing + authenticated product) |
| `apps/api` | 3002 | REST API (Next.js route handlers) |
| `apps/admin` | 3003 | Platform super-admin console |
| `apps/worker` | 3001 | Background jobs (workflows, RAG, notifications, publishing) |

Shared domain logic lives in `packages/*` (`@limbu/auth`, `@limbu/db`, `@limbu/integrations`, `@limbu/content`, etc.).

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy env templates per [ENV_SETUP.md](ENV_SETUP.md):

- `apps/web/.env.local.example` → `apps/web/.env.local`
- `apps/api/.env.example` → `apps/api/.env.local`
- `apps/worker/.env.example` → `apps/worker/.env`
- `packages/db/.env.example` → `packages/db/.env`

Verify configuration:

```bash
npm run verify:env
```

### 3. Database

```bash
npm run db:generate
npm run db:setup:local   # Docker Postgres + pgvector
# or
npm run db:setup:neon    # Neon cloud
```

### 4. Start all services (required for full functionality)

```bash
# Terminal 1 — API
npm run dev:api

# Terminal 2 — Worker
npm run dev:worker

# Terminal 3 — Web
npm run dev:web

# Optional — Admin console
npm run dev:admin
```

Open [http://localhost:3000](http://localhost:3000).

> **Important:** All marketing and product UI (`/`, `/pricing`, `/features`, `/dashboard`, etc.) runs on **`apps/web` only** (port **3000**). Do **not** use `monorepo/frontend-react` (Vite ports 5173/5174) for the main app — that project redirects to `localhost:3000`.

```bash
# From repo root — starts Next.js on port 3000
npm run dev
```

### Local infrastructure

```bash
cd infrastructure/docker
docker compose --profile local up -d postgres mailpit
```

Qdrant (for knowledge base): install locally or use [Qdrant Cloud](https://cloud.qdrant.io).

## Key Features

- **GMB automation** — Connect Google Business Profile, AI posts, scheduling, publishing
- **Review management** — Inbox, AI reply suggestions, one-click publish
- **Magic QR** — Review funnel QR codes per location
- **AI chat & agents** — Multi-model orchestration with RAG
- **Workflows** — Visual automation builder
- **Billing** — Stripe subscriptions with plan entitlements
- **Multi-tenant** — Organizations, workspaces, RBAC

## Documentation

- [ENV_SETUP.md](ENV_SETUP.md) — Full environment variable reference
- [ENVIRONMENT_READINESS_REPORT.md](ENVIRONMENT_READINESS_REPORT.md) — Production readiness audit
- [docs/architecture/ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md) — Target architecture

## Production Checklist

See sign-off checklist in [ENVIRONMENT_READINESS_REPORT.md](ENVIRONMENT_READINESS_REPORT.md).

Critical before deploy:

- Rotate `AUTH_SECRET` across web, api, admin
- Set all `*_WORKER_SECRET` values
- `BILLING_MOCK_STRIPE=false` with real Stripe keys
- `DEV_SKIP_AUTH` unset
- ≥1 AI provider API key configured
