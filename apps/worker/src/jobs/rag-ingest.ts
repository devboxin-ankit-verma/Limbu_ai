import { KnowledgeIngestJobStatus, prisma } from "@limbu/db";
import { RAG_CONFIG } from "@limbu/rag";
import { processDocumentIngest } from "@limbu/rag/ingest/pipeline";

export async function processPendingIngestJobs(limit = RAG_CONFIG.workerBatchSize) {
  const jobs = await prisma.knowledgeIngestJob.findMany({
    where: { status: KnowledgeIngestJobStatus.pending },
    orderBy: { scheduledAt: "asc" },
    take: limit,
  });

  const results = [];
  for (const job of jobs) {
    try {
      await processDocumentIngest(job.documentId);
      results.push({ documentId: job.documentId, status: "completed" });
    } catch (err) {
      results.push({
        documentId: job.documentId,
        status: "failed",
        error: err instanceof Error ? err.message : "failed",
      });
    }
  }

  return results;
}
