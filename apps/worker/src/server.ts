import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { WORKER_APP_CONFIG } from "./config";
import { processPendingIngestJobs } from "./jobs/rag-ingest";
import { processPendingNotificationJobs } from "./jobs/notifications";
import { processPendingJobs } from "./jobs/workflows";
import {
  verifyNotificationSecret,
  verifyRagSecret,
  verifyWorkflowSecret,
} from "./secrets";

async function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  if (chunks.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8")) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function json(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

function headerValue(value: string | string[] | undefined): string | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export function createWorkerServer() {
  return createServer(async (req, res) => {
    if (req.method !== "POST") {
      if (req.url === "/health" && req.method === "GET") {
        json(res, 200, { ok: true, service: "@limbu/worker" });
        return;
      }
      json(res, 405, { error: "Method not allowed" });
      return;
    }

    try {
      const body = await readJsonBody(req);

      if (req.url === "/workflows/process") {
        if (!verifyWorkflowSecret(headerValue(req.headers["x-workflow-worker-secret"]))) {
          json(res, 401, { error: "Unauthorized" });
          return;
        }
        if (body.schedule === true) {
          const { scheduleDueWorkflows } = await import("@limbu/workflows");
          const scheduled = await scheduleDueWorkflows();
          const processed = await processPendingJobs(
            typeof body.limit === "number" ? body.limit : undefined,
          );
          json(res, 200, { scheduled, processed });
          return;
        }
        const limit = typeof body.limit === "number" ? body.limit : undefined;
        const processed = await processPendingJobs(limit);
        json(res, 200, { processed });
        return;
      }

      if (req.url === "/knowledge/process") {
        if (!verifyRagSecret(headerValue(req.headers["x-rag-worker-secret"]))) {
          json(res, 401, { error: "Unauthorized" });
          return;
        }
        const limit = typeof body.limit === "number" ? body.limit : undefined;
        const results = await processPendingIngestJobs(limit);
        json(res, 200, { processed: results.length, results });
        return;
      }

      if (req.url === "/notifications/process") {
        if (!verifyNotificationSecret(headerValue(req.headers["x-notification-worker-secret"]))) {
          json(res, 401, { error: "Unauthorized" });
          return;
        }
        const limit = typeof body.limit === "number" ? body.limit : undefined;
        const result = await processPendingNotificationJobs(limit);
        json(res, 200, result);
        return;
      }

      json(res, 404, { error: "Not found" });
    } catch (err) {
      console.error("[worker]", err);
      json(res, 500, { error: err instanceof Error ? err.message : "Internal server error" });
    }
  });
}

export function startWorkerServer() {
  const server = createWorkerServer();
  server.listen(WORKER_APP_CONFIG.port, () => {
    console.log(`[worker] listening on port ${WORKER_APP_CONFIG.port}`);
  });
  return server;
}
