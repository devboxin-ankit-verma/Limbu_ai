-- Analytics & Observability Platform

ALTER TABLE "product_events" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "product_events_user_id_created_at_idx"
  ON "product_events"("user_id", "created_at");
CREATE INDEX IF NOT EXISTS "product_events_workspace_id_created_at_idx"
  ON "product_events"("workspace_id", "created_at");

CREATE TYPE "ObservabilitySeverity" AS ENUM ('debug', 'info', 'warning', 'error', 'critical');

CREATE TABLE IF NOT EXISTS "observability_errors" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "organization_id" UUID,
  "workspace_id" UUID,
  "user_id" UUID,
  "source" TEXT NOT NULL,
  "code" TEXT,
  "message" TEXT NOT NULL,
  "stack" TEXT,
  "severity" "ObservabilitySeverity" NOT NULL DEFAULT 'error',
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "resolved_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "observability_errors_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "observability_errors_organization_id_created_at_idx"
  ON "observability_errors"("organization_id", "created_at");
CREATE INDEX IF NOT EXISTS "observability_errors_source_created_at_idx"
  ON "observability_errors"("source", "created_at");
CREATE INDEX IF NOT EXISTS "observability_errors_severity_created_at_idx"
  ON "observability_errors"("severity", "created_at");

CREATE TABLE IF NOT EXISTS "observability_metrics" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "organization_id" UUID,
  "workspace_id" UUID,
  "name" TEXT NOT NULL,
  "value" DECIMAL(18, 4) NOT NULL,
  "unit" TEXT NOT NULL DEFAULT 'ms',
  "tags" JSONB NOT NULL DEFAULT '{}',
  "recorded_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "observability_metrics_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "observability_metrics_name_recorded_at_idx"
  ON "observability_metrics"("name", "recorded_at");
CREATE INDEX IF NOT EXISTS "observability_metrics_organization_id_recorded_at_idx"
  ON "observability_metrics"("organization_id", "recorded_at");
