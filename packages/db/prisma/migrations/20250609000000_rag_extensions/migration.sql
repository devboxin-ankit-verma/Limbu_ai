-- RAG extensions: knowledge bases, ingest jobs, Qdrant-oriented chunks

CREATE TYPE "KnowledgeBaseScope" AS ENUM ('workspace', 'organization', 'personal');
CREATE TYPE "KnowledgeIngestJobStatus" AS ENUM ('pending', 'processing', 'completed', 'failed');

CREATE TABLE "knowledge_bases" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "workspace_id" UUID,
    "user_id" UUID,
    "scope" "KnowledgeBaseScope" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "knowledge_bases_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "knowledge_bases_organization_id_scope_idx" ON "knowledge_bases"("organization_id", "scope");
CREATE INDEX "knowledge_bases_workspace_id_idx" ON "knowledge_bases"("workspace_id");
CREATE INDEX "knowledge_bases_user_id_idx" ON "knowledge_bases"("user_id");

ALTER TABLE "knowledge_bases" ADD CONSTRAINT "knowledge_bases_organization_id_fkey"
  FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "knowledge_bases" ADD CONSTRAINT "knowledge_bases_workspace_id_fkey"
  FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "knowledge_bases" ADD CONSTRAINT "knowledge_bases_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "knowledge_documents" ADD COLUMN "knowledge_base_id" UUID;
ALTER TABLE "knowledge_documents" ADD COLUMN "uploaded_by_id" UUID;
ALTER TABLE "knowledge_documents" ADD COLUMN "title" TEXT;
ALTER TABLE "knowledge_documents" ADD COLUMN "file_size" INTEGER;
ALTER TABLE "knowledge_documents" ADD COLUMN "processed_at" TIMESTAMPTZ;
ALTER TABLE "knowledge_documents" ALTER COLUMN "workspace_id" DROP NOT NULL;

ALTER TABLE "document_chunks" ADD COLUMN "vector_id" TEXT;
ALTER TABLE "document_chunks" ADD COLUMN "page_number" INTEGER;
ALTER TABLE "document_chunks" ADD COLUMN "citation_key" TEXT;
ALTER TABLE "document_chunks" ALTER COLUMN "workspace_id" DROP NOT NULL;
ALTER TABLE "document_chunks" DROP COLUMN IF EXISTS "embedding";

CREATE UNIQUE INDEX "document_chunks_vector_id_key" ON "document_chunks"("vector_id");
CREATE INDEX "document_chunks_organization_id_idx" ON "document_chunks"("organization_id");

CREATE TABLE "knowledge_ingest_jobs" (
    "id" UUID NOT NULL,
    "document_id" UUID NOT NULL,
    "status" "KnowledgeIngestJobStatus" NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "scheduled_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" TIMESTAMPTZ,
    "completed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "knowledge_ingest_jobs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "knowledge_ingest_jobs_document_id_key" ON "knowledge_ingest_jobs"("document_id");
CREATE INDEX "knowledge_ingest_jobs_status_scheduled_at_idx" ON "knowledge_ingest_jobs"("status", "scheduled_at");

ALTER TABLE "knowledge_ingest_jobs" ADD CONSTRAINT "knowledge_ingest_jobs_document_id_fkey"
  FOREIGN KEY ("document_id") REFERENCES "knowledge_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "knowledge_documents_knowledge_base_id_status_idx" ON "knowledge_documents"("knowledge_base_id", "status");
CREATE INDEX "knowledge_documents_organization_id_status_idx" ON "knowledge_documents"("organization_id", "status");

ALTER TABLE "knowledge_documents" ADD CONSTRAINT "knowledge_documents_knowledge_base_id_fkey"
  FOREIGN KEY ("knowledge_base_id") REFERENCES "knowledge_bases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "knowledge_documents" ADD CONSTRAINT "knowledge_documents_uploaded_by_id_fkey"
  FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS document_chunks_content_fts_idx ON document_chunks USING gin (to_tsvector('english', content));
