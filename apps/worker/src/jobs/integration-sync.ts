import { processIntegrationSyncJobs } from "@limbu/integrations";

export async function processPendingIntegrationSyncJobs(batchSize = 5) {
  return processIntegrationSyncJobs(batchSize);
}
