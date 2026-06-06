ALTER TABLE "ai_threads" ADD COLUMN IF NOT EXISTS "pinned_at" TIMESTAMPTZ;

ALTER TABLE "ai_messages" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS "ai_threads_workspace_id_user_id_pinned_at_idx"
  ON "ai_threads"("workspace_id", "user_id", "pinned_at" DESC NULLS LAST);
