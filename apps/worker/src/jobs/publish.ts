import { processPublishJobs } from "@limbu/content";

export async function processPendingPublishJobs(batchSize = 10) {
  return processPublishJobs(batchSize);
}
