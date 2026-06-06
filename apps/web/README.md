# @limbu/web

Next.js 15 frontend with Auth.js v5 authentication.

## Setup

### Production (Neon)

```powershell
# From repo root
npm install
npm run db:generate

cd packages/db
copy .env.example .env
# Set Neon DATABASE_URL (pooled) + DIRECT_URL (direct)
npm run db:setup:neon

cd ../../apps/web
copy .env.example .env
# Set same DATABASE_URL, DIRECT_URL, AUTH_SECRET, NEXTAUTH_URL
npm run dev
```

### Local development (Docker)

```powershell
docker compose -f infrastructure/docker/docker-compose.yml --profile local up -d postgres

cd packages/db
copy .env.local.example .env
npm run db:setup:local

cd ../../apps/web
copy .env.local.example .env
npm run dev
```

## Environment

| Variable | Production (Neon) | Local (Docker) |
|----------|-------------------|----------------|
| `DATABASE_URL` | Pooled connection | `localhost:5433` |
| `DIRECT_URL` | Direct connection | `localhost:5433` |
| `AUTH_SECRET` | Required (32+ bytes) | Dev secret OK |
| `NEXTAUTH_URL` | `https://app.limbu.ai` | `http://localhost:3000` |

See `.env.example` (Neon) or `.env.local.example` (Docker).

## Auth routes

| Route | Purpose |
|-------|---------|
| `/login` | Email + Google + GitHub sign-in |
| `/register` | Email registration |
| `/verify-email` | Email verification + resend |
| `/forgot-password` | Request password reset |
| `/reset-password` | Set new password |
| `/dashboard` | Protected — requires session |
| `/settings` | Protected — requires org `admin` |
