import { randomUUID } from "node:crypto";
import { KnowledgeIngestJobStatus, prisma, type Prisma } from "@limbu/db";
import { chunkDocument } from "../chunking/chunker";
import { embedTexts } from "../embedding/service";
import { parseDocumentBuffer } from "../parsing/index";
import { readDocumentBuffer, markDocumentFailed, markDocumentReady } from "../services/document.service";
import { deleteDocumentVectors, upsertChunkVectors } from "../vector/qdrant";
import type { QdrantChunkPayload } from "../types";

export async function processDocumentIngest(documentId: string) {
  const document = await prisma.knowledgeDocument.findUnique({
    where: { id: documentId },
    include: { knowledgeBase: true },
  });

  if (!document) return;

  await prisma.knowledgeIngestJob.updateMany({
    where: { documentId },
    data: {
      status: KnowledgeIngestJobStatus.processing,
      startedAt: new Date(),
      attempts: { increment: 1 },
    },
  });

  try {
    await deleteDocumentVectors(documentId);
    await prisma.documentChunk.deleteMany({ where: { documentId } });

    const buffer = await readDocumentBuffer(documentId);
    const parsed = await parseDocumentBuffer(buffer, document.mimeType, document.filename);
    const chunks = chunkDocument(parsed);

    if (chunks.length === 0) {
      throw new Error("No chunks produced from document");
    }

    const embeddings = await embedTexts(chunks.map((chunk) => chunk.content));
    const createdChunks = await prisma.$transaction(async (tx) => {
      const records = [];
      for (const chunk of chunks) {
        const vectorId = randomUUID();
        const citationKey = `${document.filename}#${chunk.chunkIndex + 1}`;
        const record = await tx.documentChunk.create({
          data: {
            documentId,
            organizationId: document.organizationId,
            workspaceId: document.workspaceId,
            content: chunk.content,
            chunkIndex: chunk.chunkIndex,
            pageNumber: chunk.pageNumber,
            citationKey,
            vectorId,
            metadata: (chunk.metadata ?? {}) as Prisma.InputJsonValue,
          },
        });
        records.push({ record, vectorId, chunk });
      }
      return records;
    });

    const qdrantPoints = createdChunks.map(({ record, vectorId, chunk }, index) => {
      const payload: QdrantChunkPayload = {
        chunkId: record.id,
        documentId: document.id,
        knowledgeBaseId: document.knowledgeBaseId,
        organizationId: document.organizationId,
        workspaceId: document.workspaceId,
        userId: document.knowledgeBase.userId,
        scope: document.knowledgeBase.scope,
        filename: document.filename,
        title: document.title,
        chunkIndex: chunk.chunkIndex,
        pageNumber: chunk.pageNumber ?? null,
        citationKey: record.citationKey ?? `${document.filename}#${chunk.chunkIndex + 1}`,
        content: chunk.content,
      };

      return {
        id: vectorId,
        vector: embeddings[index],
        payload,
      };
    });

    await upsertChunkVectors(qdrantPoints);
    await markDocumentReady(documentId, chunks.length, parsed.metadata as Prisma.InputJsonValue);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ingest failed";
    await markDocumentFailed(documentId, message);
    throw err;
  }
}
