-- Limbu AI — Supplementary SQL (apply after Prisma migrate)
-- Items Prisma schema cannot express: partial indexes, HNSW, CHECK constraints, RLS

-- =============================================================================
-- EXTENSIONS (if not created by Prisma)
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =============================================================================
-- PARTIAL UNIQUE INDEXES (soft-delete support)
-- =============================================================================
CREATE UNIQUE INDEX IF NOT EXISTS users_email_active_idx
  ON users (email)
  WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS organizations_slug_active_idx
  ON organizations (slug)
  WHERE deleted_at IS NULL;

-- =============================================================================
-- VECTOR INDEX (HNSW)
-- =============================================================================
CREATE INDEX IF NOT EXISTS document_chunks_embedding_hnsw_idx
  ON document_chunks
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- =============================================================================
-- CHECK CONSTRAINTS
-- =============================================================================
ALTER TABLE reviews
  ADD CONSTRAINT reviews_rating_check CHECK (rating BETWEEN 1 AND 5);

ALTER TABLE credit_balances
  ADD CONSTRAINT credit_balances_non_negative CHECK (balance >= 0 AND reserved >= 0);

ALTER TABLE credit_transactions
  ADD CONSTRAINT credit_transactions_amount_nonzero CHECK (amount <> 0);

ALTER TABLE publish_jobs
  ADD CONSTRAINT publish_jobs_attempts_check CHECK (attempts >= 0 AND attempts <= 5);

-- =============================================================================
-- FULL-TEXT SEARCH (P1)
-- =============================================================================
CREATE INDEX IF NOT EXISTS posts_content_fts_idx
  ON posts USING gin (to_tsvector('english', content::text));

CREATE INDEX IF NOT EXISTS reviews_text_fts_idx
  ON reviews USING gin (to_tsvector('english', coalesce(text, '')));

-- =============================================================================
-- ROW-LEVEL SECURITY (enable — policies applied per deployment)
-- =============================================================================
-- Example policy template (repeat for all workspace-scoped tables):
-- ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY posts_workspace_isolation ON posts
--   USING (workspace_id = current_setting('app.workspace_id', true)::uuid);
