import {
  KnowledgeDocumentStatus,
  KnowledgeIngestJobStatus,
  prisma,
  type Prisma,
} from "@limbu/db";
import path from "node:path";
import { requireKnowledgeBaseAccess } from "../access";
import { EXTENSION_MIME, RAG_CONFIG, SUPPORTED_EXTENSIONS } from "../config";
import { RagValidationError } from "../errors";
import { deleteStoredFile, readStoredFile, saveUploadedFile } from "../storage/files";
import { listDocumentsSchema } from "../validators";
import { deleteDocumentVectors } from "../vector/qdrant";
import { enqueueDocumentIngest } from "../ingest/worker";
import type { KnowledgeDocumentRecord, RagAccessContext } from "../types";

function toRecord(doc: {
  id: string;
  knowledgeBaseId: string;
  organizationId: string;
  workspaceId: string | null;
  uploadedById: string;
  filename: string;
  title: string | null;
  mimeType: string | null;
  fileSize: number | null;
  status: KnowledgeDocumentStatus;
  chunkCount: number;
  error: string | null;
  processedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): KnowledgeDocumentRecord {
  return doc;
}

export async function listDocuments(
  knowledgeBaseId: string,
  ctx: RagAccessContext,
  query?: { cursor?: string; limit?: number; status?: string },
) {
  await requireKnowledgeBaseAccess(knowledgeBaseId, ctx);
  const parsed = listDocumentsSchema.safeParse(query ?? {});
  if (!parsed.success) throw new RagValidationError("Invalid query");

  const limit = parsed.data.limit ?? 20;
  const documents = await prisma.knowledgeDocument.findMany({
    where: {
      knowledgeBaseId,
      organizationId: ctx.organizationId,
      ...(parsed.data.status ? { status: parsed.data.status as KnowledgeDocumentStatus } : {}),
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    ...(parsed.data.cursor ? { cursor: { id: parsed.data.cursor }, skip: 1 } : {}),
  });

  const hasMore = documents.length > limit;
  const page = hasMore ? documents.slice(0, limit) : documents;

  return {
    documents: page.map(toRecord),
    nextCursor: hasMore ? page[page.length - 1]?.id ?? null : null,
    hasMore,
  };
}

export async function uploadDocument(
  knowledgeBaseId: string,
  ctx: RagAccessContext,
  file: { filename: string; mimeType?: string; buffer: Buffer },
) {
  const kb = await requireKnowledgeBaseAccess(knowledgeBaseId, ctx, { write: true });
  validateUpload(file.filename, file.buffer.length);

  const {
    assertKnowledgeDocumentQuota,
    assertStorageQuota,
    assertFeature,
    trackUsage,
  } = await import("@limbu/billing");
  const { UsageMetricCategory } = await import("@limbu/db");
  await assertFeature(kb.organizationId, "knowledge_base_rag");
  await assertKnowledgeDocumentQuota(kb.organizationId);
  await assertStorageQuota(kb.organizationId, file.buffer.length);

  const ext = path.extname(file.filename).toLowerCase();
  const mimeType = file.mimeType ?? EXTENSION_MIME[ext] ?? "application/octet-stream";
  const title = path.basename(file.filename, ext);

  const document = await prisma.knowledgeDocument.create({
    data: {
      knowledgeBaseId,
      organizationId: kb.organizationId,
      workspaceId: kb.workspaceId,
      uploadedById: ctx.userId,
      filename: file.filename,
      title,
      s3Key: "pending",
      mimeType,
      fileSize: file.buffer.length,
      status: KnowledgeDocumentStatus.uploading,
    },
  });

  const stored = await saveUploadedFile({
    organizationId: kb.organizationId,
    knowledgeBaseId,
    documentId: document.id,
    filename: file.filename,
    buffer: file.buffer,
  });

  await prisma.knowledgeDocument.update({
    where: { id: document.id },
    data: {
      s3Key: stored.storageKey,
      checksum: stored.checksum,
      status: KnowledgeDocumentStatus.processing,
    },
  });

  await enqueueDocumentIngest(document.id);

  await trackUsage({
    organizationId: kb.organizationId,
    category: UsageMetricCategory.storage_bytes,
    quantity: file.buffer.length,
    referenceId: document.id,
  });
  await trackUsage({
    organizationId: kb.organizationId,
    category: UsageMetricCategory.knowledge_base_documents,
    quantity: 1,
    referenceId: document.id,
  });

  const { trackProductEvent, PRODUCT_EVENTS } = await import("@limbu/analytics");
  void trackProductEvent({
    eventName: PRODUCT_EVENTS.KNOWLEDGE_UPLOAD,
    userId: ctx.userId,
    organizationId: kb.organizationId,
    workspaceId: kb.workspaceId ?? undefined,
    properties: { documentId: document.id, fileSize: file.buffer.length },
  }).catch(() => {});

  const updated = await prisma.knowledgeDocument.findUnique({ where: { id: document.id } });
  return toRecord(updated!);
}

export async function getDocument(documentId: string, ctx: RagAccessContext) {
  const document = await prisma.knowledgeDocument.findUnique({
    where: { id: documentId },
    include: { knowledgeBase: true },
  });
  if (!document || document.organizationId !== ctx.organizationId) {
    throw new RagValidationError("Document not found");
  }
  await requireKnowledgeBaseAccess(document.knowledgeBaseId, ctx);
  return toRecord(document);
}

export async function deleteDocument(documentId: string, ctx: RagAccessContext) {
  const document = await prisma.knowledgeDocument.findUnique({
    where: { id: documentId },
    include: { knowledgeBase: true },
  });
  if (!document || document.organizationId !== ctx.organizationId) {
    throw new RagValidationError("Document not found");
  }
  await requireKnowledgeBaseAccess(document.knowledgeBaseId, ctx, { write: true });

  await deleteDocumentVectors(documentId);
  if (document.s3Key && document.s3Key !== "pending") {
    await deleteStoredFile(document.s3Key);
  }

  await prisma.knowledgeDocument.delete({ where: { id: documentId } });
  return { id: documentId };
}

export async function reindexDocument(documentId: string, ctx: RagAccessContext) {
  const document = await getDocument(documentId, ctx);
  await requireKnowledgeBaseAccess(document.knowledgeBaseId, ctx, { write: true });

  await prisma.$transaction(async (tx) => {
    await tx.documentChunk.deleteMany({ where: { documentId } });
    await tx.knowledgeDocument.update({
      where: { id: documentId },
      data: {
        status: KnowledgeDocumentStatus.reprocessing,
        chunkCount: 0,
        error: null,
        processedAt: null,
      },
    });
    await tx.knowledgeIngestJob.upsert({
      where: { documentId },
      create: {
        documentId,
        status: KnowledgeIngestJobStatus.pending,
        scheduledAt: new Date(),
      },
      update: {
        status: KnowledgeIngestJobStatus.pending,
        attempts: 0,
        lastError: null,
        scheduledAt: new Date(),
        startedAt: null,
        completedAt: null,
      },
    });
  });

  await deleteDocumentVectors(documentId);
  await enqueueDocumentIngest(documentId);
  return getDocument(documentId, ctx);
}

export async function readDocumentBuffer(documentId: string) {
  const document = await prisma.knowledgeDocument.findUnique({ where: { id: documentId } });
  if (!document) throw new RagValidationError("Document not found");
  return readStoredFile(document.s3Key);
}

function validateUpload(filename: string, size: number) {
  const ext = path.extname(filename).toLowerCase();
  if (!SUPPORTED_EXTENSIONS.has(ext)) {
    throw new RagValidationError(`Unsupported file type: ${ext || "unknown"}`);
  }
  if (size <= 0) throw new RagValidationError("File is empty");
  if (size > RAG_CONFIG.maxFileSizeBytes) {
    throw new RagValidationError(
      `File exceeds maximum size of ${RAG_CONFIG.maxFileSizeBytes / (1024 * 1024)}MB`,
    );
  }
}

export async function markDocumentFailed(documentId: string, error: string) {
  await prisma.$transaction(async (tx) => {
    await tx.knowledgeDocument.update({
      where: { id: documentId },
      data: {
        status: KnowledgeDocumentStatus.failed,
        error: error.slice(0, 2000),
      },
    });
    await tx.knowledgeIngestJob.updateMany({
      where: { documentId },
      data: {
        status: KnowledgeIngestJobStatus.failed,
        lastError: error.slice(0, 2000),
        completedAt: new Date(),
      },
    });
  });
}

export async function markDocumentReady(
  documentId: string,
  chunkCount: number,
  metadata?: Prisma.InputJsonValue,
) {
  await prisma.$transaction(async (tx) => {
    await tx.knowledgeDocument.update({
      where: { id: documentId },
      data: {
        status: KnowledgeDocumentStatus.ready,
        chunkCount,
        processedAt: new Date(),
        error: null,
      },
    });
    await tx.knowledgeIngestJob.updateMany({
      where: { documentId },
      data: {
        status: KnowledgeIngestJobStatus.completed,
        completedAt: new Date(),
      },
    });
  });
}
