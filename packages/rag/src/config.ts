export const RAG_CONFIG = {
  uploadDir: process.env.RAG_UPLOAD_DIR ?? ".uploads/knowledge",
  qdrantUrl: process.env.QDRANT_URL ?? "http://127.0.0.1:6333",
  qdrantApiKey: process.env.QDRANT_API_KEY,
  collectionName: process.env.QDRANT_COLLECTION ?? "limbu_knowledge",
  embeddingModel: process.env.RAG_EMBEDDING_MODEL ?? "text-embedding-3-small",
  embeddingDimensions: 1536,
  chunkSize: Number(process.env.RAG_CHUNK_SIZE ?? 1000),
  chunkOverlap: Number(process.env.RAG_CHUNK_OVERLAP ?? 200),
  maxFileSizeBytes: Number(process.env.RAG_MAX_FILE_SIZE_MB ?? 25) * 1024 * 1024,
  maxContextRatio: 0.3,
  defaultTopK: 5,
  workerBatchSize: Number(process.env.RAG_WORKER_BATCH_SIZE ?? 5),
  workerSecret: process.env.RAG_WORKER_SECRET,
} as const;

export const SUPPORTED_EXTENSIONS = new Set([
  ".pdf",
  ".docx",
  ".txt",
  ".md",
  ".markdown",
  ".csv",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
]);

export const EXTENSION_MIME: Record<string, string> = {
  ".pdf": "application/pdf",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".txt": "text/plain",
  ".md": "text/markdown",
  ".markdown": "text/markdown",
  ".csv": "text/csv",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};
