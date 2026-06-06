# Neon PostgreSQL (Production)

Limbu uses [Neon](https://neon.tech) for production PostgreSQL. Prisma is configured with separate pooled and direct connections — required for serverless and migration compatibility.

## Connection model

| Variable | Neon endpoint | Used by |
|----------|---------------|---------|
| `DATABASE_URL` | **Pooled** (`-pooler` hostname) | App runtime — Next.js, Prisma Client |
| `DIRECT_URL` | **Direct** (no pooler) | Prisma Migrate, `db:setup`, supplementary SQL |

Prisma reads both from `packages/db/prisma/schema.prisma`:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

## Setup

### 1. Create a Neon project

1. Go to [console.neon.tech](https://console.neon.tech)
2. Create a project (PostgreSQL 16, region closest to your app)
3. Copy **Pooled** and **Direct** connection strings from the dashboard

### 2. Enable extensions

Neon supports `vector` and `pg_trgm`. Enable them once per database:

```powershell
cd packages/db
# Set DIRECT_URL in .env first, then:
npm run db:neon:extensions
```

Or run manually in the Neon SQL Editor:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

### 3. Configure environment

```powershell
cd packages/db
copy .env.example .env
# Paste your Neon pooled URL → DATABASE_URL
# Paste your Neon direct URL  → DIRECT_URL

cd ../../apps/web
copy .env.example .env
# Set the same DATABASE_URL and DIRECT_URL
```

### 4. Deploy schema

```powershell
cd packages/db
npm run db:setup:neon
```

This runs: `migrate deploy` → supplementary SQL → seed.

## Production deployment

Set these secrets in your hosting platform (Vercel, Railway, Fly.io, etc.):

```
DATABASE_URL=<neon-pooled-connection-string>
DIRECT_URL=<neon-direct-connection-string>
```

Only `DATABASE_URL` is needed at runtime for the web app. `DIRECT_URL` is required in CI/CD for migrations.

### CI migration example

```yaml
- run: npm run db:migrate:deploy --workspace=@limbu/db
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
    DIRECT_URL: ${{ secrets.DIRECT_URL }}
- run: npm run db:supplementary --workspace=@limbu/db
  env:
    DATABASE_URL: ${{ secrets.DIRECT_URL }}  # supplementary uses direct
    DIRECT_URL: ${{ secrets.DIRECT_URL }}
```

## Local development

Local Docker PostgreSQL remains available for offline dev. See `infrastructure/docker/README.md` and use `.env.local.example` templates.

```powershell
docker compose --profile local up -d postgres
copy .env.local.example .env   # in packages/db and apps/web
npm run db:setup:local
```

## Neon + Prisma notes

- Always use `sslmode=require` in connection strings
- Migrations **must** use `DIRECT_URL` — pooled connections will fail on DDL
- `pgvector` HNSW indexes (in `supplementary.sql`) are supported on Neon
- Connection limit: Neon free tier has limits; pooled endpoint handles concurrency better than direct
