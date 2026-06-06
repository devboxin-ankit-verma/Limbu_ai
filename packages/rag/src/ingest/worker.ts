import { KnowledgeIngestJobStatus, prisma } from "@limbu/db";

export async function enqueueDocumentIngest(documentId: string) {
  await prisma.knowledgeIngestJob.upsert({
    where: { documentId },
    create: {
      documentId,
      status: KnowledgeIngestJobStatus.pending,
      scheduledAt: new Date(),
    },
    update: {
      status: KnowledgeIngestJobStatus.pending,
      scheduledAt: new Date(),
    },
  });
}

export function verifyWorkerSecret(headerValue: string | null) {
  const secret = process.env.RAG_WORKER_SECRET ?? "";
  if (!secret) return true;
  return headerValue === secret;
}
