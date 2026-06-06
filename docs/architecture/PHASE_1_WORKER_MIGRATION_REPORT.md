# Phase 1 Migration Report — Worker Extraction

**Date:** 2026-06-05  
**Scope:** Phase 1 only (worker app extraction)  
**Status:** Complete

---

## Executive Summary

Phase 1 extracts all background job **processors** from domain packages into a dedicated `@limbu/worker` app. Packages retain **enqueue** and **verify-secret** logic only. The Next.js web app keeps its existing worker HTTP routes for backward compatibility; those routes now delegate to `@limbu/worker` job functions instead of in-package processors.

No business logic was modified. No UI changes were made. `apps/api`, `apps/admin`, and `apps/mobile` were not created.

---

## What Was Created

### `apps/worker` (`@limbu/worker`)

| File | Purpose |
|------|---------|
| `src/main.ts` | Process entrypoint — starts HTTP server + poll loop |
| `src/index.ts` | Library exports (no side effects on import) |
| `src/config.ts` | Port, poll interval, batch sizes |
| `src/secrets.ts` | Delegates to package `verifyWorkerSecret` functions |
| `src/server.ts` | HTTP server with job trigger endpoints |
| `src/jobs/workflows.ts` | Workflow job processor (moved from `@limbu/workflows`) |
| `src/jobs/rag-ingest.ts` | RAG ingest processor (moved from `@limbu/rag`) |
| `src/jobs/notifications.ts` | Notification dispatch processor (moved from `@limbu/notifications`) |
| `package.json` | Workspace package with subpath exports for job modules |
| `tsconfig.json` | TypeScript config |

### Root scripts

```json
"dev:worker": "npm run dev --workspace=@limbu/worker",
"typecheck:worker": "npm run typecheck --workspace=@limbu/worker"
```

---

## What Was Moved

| Processor | Source (before) | Destination (after) |
|-----------|-----------------|----------------------|
| `processPendingJobs`, `processJob`, `failJob`, `drainWorkflowQueue` | `packages/workflows/src/queue/processor.ts` | `apps/worker/src/jobs/workflows.ts` |
| `processPendingIngestJobs` | `packages/rag/src/ingest/worker.ts` | `apps/worker/src/jobs/rag-ingest.ts` |
| `processPendingNotificationJobs`, `processNotificationJob`, `drainNotificationQueue` | `packages/notifications/src/services/dispatch.service.ts` + `queue/processor.ts` | `apps/worker/src/jobs/notifications.ts` |

---

## What Stayed in Packages

| Package | Retained responsibilities |
|---------|---------------------------|
| `@limbu/workflows` | `enqueueWorkflowRun`, `scheduleDueWorkflows`, `runSchedulerTick`, graph execution, `verifyWorkerSecret` |
| `@limbu/rag` | `enqueueDocumentIngest`, ingest pipeline, `verifyWorkerSecret` |
| `@limbu/notifications` | `enqueueNotificationJob`, `dispatchNotification`, templates, preferences, `verifyWorkerSecret` |

### Package trim summary

- **`packages/workflows/src/queue/processor.ts`** — enqueue only (`enqueueWorkflowRun`)
- **`packages/workflows/src/scheduler/scheduler.ts`** — `runSchedulerTick()` schedules only; no inline processing
- **`packages/rag/src/ingest/worker.ts`** — enqueue + secret verify only
- **`packages/notifications`** — removed `queue/processor.ts`; dispatch service no longer drains inline
- **`packages/rag/package.json`** — added export `"./ingest/pipeline"` for worker pipeline import

---

## Web App Changes (API routes only — no UI)

Three worker trigger routes now import from `@limbu/worker`:

| Route | Import |
|-------|--------|
| `apps/web/app/api/workflows/worker/process/route.ts` | `processPendingJobs` |
| `apps/web/app/api/knowledge/worker/process/route.ts` | `processPendingIngestJobs` |
| `apps/web/app/api/notifications/worker/process/route.ts` | `processPendingNotificationJobs` |

Supporting config (not UI):

- `apps/web/package.json` — added `@limbu/worker` dependency
- `apps/web/next.config.ts` — added `@limbu/worker` to `transpilePackages`
- `apps/web/.env.example` — worker env vars documented

---

## Architecture After Phase 1

```
┌─────────────────────────────────────────────────────────────────┐
│                         apps/web (Next.js)                       │
│  UI + API routes                                                 │
│  /api/workflows/worker/process  ──┐                              │
│  /api/knowledge/worker/process  ──┼──► @limbu/worker (job fns)   │
│  /api/notifications/worker/process┘                              │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    apps/worker (@limbu/worker)                   │
│  HTTP :3001          Poll loop (optional)                        │
│  POST /workflows/process                                         │
│  POST /knowledge/process                                         │
│  POST /notifications/process                                     │
│  GET  /health                                                    │
└─────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
            @limbu/workflows   @limbu/rag   @limbu/notifications
            (enqueue, exec)    (pipeline)   (dispatch helpers)
                    │               │               │
                    └───────────────┴───────────────┘
                                    ▼
                              @limbu/db (Prisma)
```

### Job flow

1. **Enqueue** — API or domain code creates job rows via package functions
2. **Process** — Worker poll loop or HTTP trigger runs processors in `apps/worker`
3. **Execute** — Processors call existing package logic (`executeWorkflowGraph`, `processDocumentIngest`, email/push delivery)

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `WORKER_PORT` | `3001` | Standalone worker HTTP port |
| `WORKER_POLL_INTERVAL_MS` | `5000` | Background poll interval |
| `WORKER_POLL_ENABLED` | `true` | Set `false` to disable poll loop |
| `WORKFLOW_WORKER_SECRET` | `""` | Auth header for workflow endpoints (empty = dev open) |
| `RAG_WORKER_SECRET` | `""` | Auth header for RAG endpoints |
| `NOTIFICATION_WORKER_SECRET` | `""` | Auth header for notification endpoints |
| `WORKFLOW_WORKER_BATCH_SIZE` | `10` | Workflow jobs per tick |
| `RAG_WORKER_BATCH_SIZE` | `5` | RAG jobs per tick |
| `NOTIFICATION_WORKER_BATCH_SIZE` | `25` | Notification jobs per tick |
| `DATABASE_URL` | — | Required (shared with web) |

---

## How to Run

### Standalone worker (recommended for production)

```bash
npm run dev:worker
# or
npm run start --workspace=@limbu/worker
```

### Trigger jobs via HTTP

```bash
curl http://localhost:3001/health

curl -X POST http://localhost:3001/workflows/process \
  -H "Content-Type: application/json" \
  -d '{"limit": 10}'

curl -X POST http://localhost:3001/knowledge/process \
  -H "Content-Type: application/json" \
  -d '{}'

curl -X POST http://localhost:3001/notifications/process \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Legacy web cron routes (unchanged URLs)

Existing cron/webhook integrations can continue calling:

- `POST /api/workflows/worker/process`
- `POST /api/knowledge/worker/process`
- `POST /api/notifications/worker/process`

---

## Verification Results

### Type checks

| Target | Result |
|--------|--------|
| `@limbu/worker` | Pass |
| `@limbu/web` | Pass |

### Worker smoke test (2026-06-05)

| Endpoint | Result |
|----------|--------|
| `GET /health` | `200 {"ok":true,"service":"@limbu/worker"}` |
| `POST /workflows/process` | Processor invoked (DB unreachable in test env — expected) |
| `POST /knowledge/process` | Processor invoked (DB unreachable in test env — expected) |
| `POST /notifications/process` | Processor invoked (DB unreachable in test env — expected) |

All three job endpoints correctly route to their processors and return structured JSON. Failures were due to local PostgreSQL not running on `localhost:5433`, not worker wiring issues.

### Import safety

`src/index.ts` no longer auto-starts the worker on import. Only `src/main.ts` (used by `dev`/`start` scripts) calls `startWorker()`. Web API routes can safely import job functions without spawning a second HTTP server.

---

## Files Deleted

- `packages/notifications/src/queue/processor.ts` (logic consolidated into `apps/worker`)

---

## Out of Scope (Future Phases)

| Phase | Work |
|-------|------|
| Phase 2+ | Extract `apps/api` from web API routes |
| Phase 2+ | Extract `apps/admin` from web admin UI |
| Phase 2+ | Create `apps/mobile` |
| Follow-up | Point cron jobs directly at `apps/worker:3001` instead of web routes |
| Follow-up | Set worker secrets in production (currently fail-open when empty) |

---

## Dependency Graph

```
@limbu/worker
  ├── @limbu/db
  ├── @limbu/workflows
  ├── @limbu/rag
  └── @limbu/notifications

@limbu/web
  └── @limbu/worker (job function imports only)

@limbu/workflows ──► (no dependency on @limbu/worker)
@limbu/rag         ──► (no dependency on @limbu/worker)
@limbu/notifications ──► (no dependency on @limbu/worker)
```

No circular dependencies introduced.

---

## Conclusion

Phase 1 successfully isolates background job processing into `apps/worker` while preserving all existing enqueue paths, API route URLs, and business logic. The monorepo is now ready for Phase 2 (API/admin extraction) when approved.
