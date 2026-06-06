export const WORKER_APP_CONFIG = {
  port: Number(process.env.WORKER_PORT ?? 3001),
  pollIntervalMs: Number(process.env.WORKER_POLL_INTERVAL_MS ?? 5000),
  pollEnabled: process.env.WORKER_POLL_ENABLED !== "false",
  workflowBatchSize: Number(process.env.WORKFLOW_WORKER_BATCH_SIZE ?? 10),
  ragBatchSize: Number(process.env.RAG_WORKER_BATCH_SIZE ?? 5),
  notificationBatchSize: Number(process.env.NOTIFICATION_WORKER_BATCH_SIZE ?? 25),
} as const;
