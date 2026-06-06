export const WORKFLOW_CONFIG = {
  workerBatchSize: Number(process.env.WORKFLOW_WORKER_BATCH_SIZE ?? 10),
  workerSecret: process.env.WORKFLOW_WORKER_SECRET,
  maxLoopIterations: Number(process.env.WORKFLOW_MAX_LOOP_ITERATIONS ?? 100),
  defaultMaxAttempts: 3,
  retryBaseDelayMs: 1000,
} as const;
