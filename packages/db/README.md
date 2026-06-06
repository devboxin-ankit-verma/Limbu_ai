# @limbu/db

Prisma schema, migrations, and seed data for the Limbu platform.

## Database targets

| Environment | Host | Config template |
|-------------|------|-----------------|
| **Production** | Neon PostgreSQL | `.env.example` |
| **Local dev** | Docker PostgreSQL | `.env.local.example` |

## Production (Neon)

```powershell
cd packages/db
copy .env.example .env
# Set DATABASE_URL (pooled) and DIRECT_URL (direct) from Neon dashboard

npm run db:setup:neon
```

See [infrastructure/neon/README.md](../../infrastructure/neon/README.md) for full setup.

### Prisma connection model

```
DATABASE_URL  →  Neon pooled endpoint   →  App runtime (Prisma Client)
DIRECT_URL    →  Neon direct endpoint   →  Migrations & supplementary SQL
```

Both are required in `schema.prisma` for Neon compatibility.

## Local development (Docker)

```powershell
cd infrastructure/docker
docker compose --profile local up -d postgres

cd ../../packages/db
copy .env.local.example .env
npm run db:setup:local
```

## Scripts

| Script | Description |
|--------|-------------|
| `db:generate` | Generate Prisma client |
| `db:migrate` | Create/apply migrations (dev) |
| `db:migrate:deploy` | Apply migrations (production / CI) |
| `db:supplementary` | Apply indexes, HNSW, CHECK constraints |
| `db:seed` | Seed plan entitlements, feature flags, prompt templates |
| `db:setup:neon` | Full Neon setup: extensions + migrate + supplementary + seed |
| `db:setup:local` | Full local setup via Docker Postgres |
| `db:neon:extensions` | Enable `vector` + `pg_trgm` on Neon |
| `db:studio` | Open Prisma Studio |

## Supplementary SQL

Prisma cannot express partial unique indexes, HNSW vector indexes, or some CHECK constraints. These are applied via `prisma/migrations/supplementary.sql` after every migration.

## Usage in apps

```typescript
import { prisma, type TenantContext } from "@limbu/db";
```
