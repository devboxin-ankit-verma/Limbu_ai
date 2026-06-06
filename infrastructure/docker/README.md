# Local Infrastructure

Docker Compose stack for **local development only**. Production uses [Neon PostgreSQL](../neon/README.md).

## Services

| Service | Port | Profile | Purpose |
|---------|------|---------|---------|
| postgres | 5433 | `local` | PostgreSQL 16 + pgvector |
| redis | 6379 | default | Cache + BullMQ queues |
| minio | 9000/9001 | default | S3-compatible object storage |
| mailpit | 1025/8025 | default | Local email capture |

Postgres is behind the `local` profile — it does not start unless explicitly requested.

## Start (local database)

```powershell
# Postgres only (for DB work)
docker compose --profile local up -d postgres

# Full local stack (redis, minio, mailpit — no postgres)
docker compose up -d

# Everything including postgres
docker compose --profile local up -d
```

Then configure local env and run setup:

```powershell
cd ../../packages/db
copy .env.local.example .env
npm run db:setup:local
```

## Credentials (local only)

- **PostgreSQL:** `limbu` / `limbu` — database `limbu` on port **5433**
- **MinIO:** `limbu` / `limbu_secret` — console at http://localhost:9001
- **Mailpit UI:** http://localhost:8025

## Production

Do not use Docker Postgres in production. See [infrastructure/neon/README.md](../neon/README.md).
