import { WORKER_APP_CONFIG } from "./config";
import { processPendingIntegrationSyncJobs } from "./jobs/integration-sync";
import { processPendingIngestJobs } from "./jobs/rag-ingest";
import { processPendingNotificationJobs } from "./jobs/notifications";
import { processPendingPublishJobs } from "./jobs/publish";
import { processPendingJobs } from "./jobs/workflows";
import { startWorkerServer } from "./server";

export {
  processPendingJobs,
  processJob,
  drainWorkflowQueue,
} from "./jobs/workflows";
export { processPendingIngestJobs } from "./jobs/rag-ingest";
export { processPendingNotificationJobs, drainNotificationQueue } from "./jobs/notifications";
export { startWorkerServer, createWorkerServer } from "./server";
export { WORKER_APP_CONFIG } from "./config";

async function pollTick() {
  try {
    const { scheduleDueWorkflows } = await import("@limbu/workflows");
    await scheduleDueWorkflows();
    await processPendingJobs(WORKER_APP_CONFIG.workflowBatchSize);
    await processPendingIngestJobs(WORKER_APP_CONFIG.ragBatchSize);
    await processPendingNotificationJobs(WORKER_APP_CONFIG.notificationBatchSize);
    await processPendingPublishJobs(10);
    await processPendingIntegrationSyncJobs(5);
  } catch (err) {
    console.error("[worker] poll tick failed:", err);
  }
}

export async function startWorker(options?: { http?: boolean; poll?: boolean }) {
  const http = options?.http ?? true;
  const poll = options?.poll ?? WORKER_APP_CONFIG.pollEnabled;

  if (http) {
    startWorkerServer();
  }

  if (poll) {
    void pollTick();
    setInterval(() => void pollTick(), WORKER_APP_CONFIG.pollIntervalMs);
    console.log(`[worker] poll interval ${WORKER_APP_CONFIG.pollIntervalMs}ms`);
  }
}
