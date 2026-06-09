-- Workflow automation engine extensions

CREATE TYPE "WorkflowJobStatus" AS ENUM ('pending', 'processing', 'completed', 'failed', 'dead_letter');
CREATE TYPE "WorkflowTriggerType" AS ENUM ('manual', 'scheduled', 'webhook', 'database_event', 'file_upload', 'agent');

ALTER TABLE "workflows" ADD COLUMN "created_by_id" UUID;
ALTER TABLE "workflows" ADD COLUMN "description" TEXT;
ALTER TABLE "workflows" ADD COLUMN "trigger_type" "WorkflowTriggerType" NOT NULL DEFAULT 'manual';
ALTER TABLE "workflows" ADD COLUMN "definition" JSONB NOT NULL DEFAULT '{"nodes":[],"edges":[]}';
ALTER TABLE "workflows" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "workflows" ADD COLUMN "published_version_id" UUID;
ALTER TABLE "workflows" ADD COLUMN "webhook_secret" TEXT;
ALTER TABLE "workflows" ADD COLUMN "template_id" UUID;
ALTER TABLE "workflows" ALTER COLUMN "trigger_config" SET DEFAULT '{}';

CREATE INDEX "workflows_workspace_id_status_idx" ON "workflows"("workspace_id", "status");
CREATE INDEX "workflows_organization_id_status_idx" ON "workflows"("organization_id", "status");

ALTER TABLE "workflows" ADD CONSTRAINT "workflows_created_by_id_fkey"
  FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "workflow_versions" (
    "id" UUID NOT NULL,
    "workflow_id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "definition" JSONB NOT NULL,
    "trigger_config" JSONB NOT NULL,
    "change_notes" TEXT,
    "created_by_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workflow_versions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "workflow_versions_workflow_id_version_key" ON "workflow_versions"("workflow_id", "version");

ALTER TABLE "workflow_versions" ADD CONSTRAINT "workflow_versions_workflow_id_fkey"
  FOREIGN KEY ("workflow_id") REFERENCES "workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "workflows" ADD CONSTRAINT "workflows_published_version_id_fkey"
  FOREIGN KEY ("published_version_id") REFERENCES "workflow_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "workflow_runs" ADD COLUMN "workflow_version_id" UUID;
ALTER TABLE "workflow_runs" ADD COLUMN "user_id" UUID;
ALTER TABLE "workflow_runs" ADD COLUMN "variables" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "workflow_runs" ADD COLUMN "metrics" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "workflow_runs" ADD COLUMN "error" TEXT;
ALTER TABLE "workflow_runs" ADD COLUMN "duration_ms" INTEGER;
ALTER TABLE "workflow_runs" ALTER COLUMN "trigger_event" SET DEFAULT '{}';

CREATE INDEX "workflow_runs_workflow_id_started_at_idx" ON "workflow_runs"("workflow_id", "started_at");

ALTER TABLE "workflow_runs" ADD CONSTRAINT "workflow_runs_workflow_version_id_fkey"
  FOREIGN KEY ("workflow_version_id") REFERENCES "workflow_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "workflow_runs" ADD CONSTRAINT "workflow_runs_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "workflow_execution_jobs" (
    "id" UUID NOT NULL,
    "workflow_id" UUID NOT NULL,
    "workflow_version_id" UUID,
    "run_id" UUID,
    "organization_id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "status" "WorkflowJobStatus" NOT NULL DEFAULT 'pending',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 3,
    "scheduled_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" TIMESTAMPTZ,
    "completed_at" TIMESTAMPTZ,
    "last_error" TEXT,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "idempotency_key" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "workflow_execution_jobs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "workflow_execution_jobs_idempotency_key_key" ON "workflow_execution_jobs"("idempotency_key");
CREATE INDEX "workflow_execution_jobs_status_scheduled_at_idx" ON "workflow_execution_jobs"("status", "scheduled_at");
CREATE INDEX "workflow_execution_jobs_workspace_id_status_idx" ON "workflow_execution_jobs"("workspace_id", "status");

ALTER TABLE "workflow_execution_jobs" ADD CONSTRAINT "workflow_execution_jobs_workflow_id_fkey"
  FOREIGN KEY ("workflow_id") REFERENCES "workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "workflow_execution_jobs" ADD CONSTRAINT "workflow_execution_jobs_run_id_fkey"
  FOREIGN KEY ("run_id") REFERENCES "workflow_runs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "workflow_execution_logs" (
    "id" UUID NOT NULL,
    "run_id" UUID NOT NULL,
    "node_id" TEXT NOT NULL,
    "node_type" TEXT NOT NULL,
    "node_kind" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "input" JSONB,
    "output" JSONB,
    "error" TEXT,
    "duration_ms" INTEGER,
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ,

    CONSTRAINT "workflow_execution_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "workflow_execution_logs_run_id_started_at_idx" ON "workflow_execution_logs"("run_id", "started_at");

ALTER TABLE "workflow_execution_logs" ADD CONSTRAINT "workflow_execution_logs_run_id_fkey"
  FOREIGN KEY ("run_id") REFERENCES "workflow_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "workflow_dead_letters" (
    "id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "run_id" UUID,
    "workflow_id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "error" TEXT NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workflow_dead_letters_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "workflow_dead_letters_job_id_key" ON "workflow_dead_letters"("job_id");
CREATE INDEX "workflow_dead_letters_workspace_id_created_at_idx" ON "workflow_dead_letters"("workspace_id", "created_at");

ALTER TABLE "workflow_dead_letters" ADD CONSTRAINT "workflow_dead_letters_job_id_fkey"
  FOREIGN KEY ("job_id") REFERENCES "workflow_execution_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "workflow_dead_letters" ADD CONSTRAINT "workflow_dead_letters_run_id_fkey"
  FOREIGN KEY ("run_id") REFERENCES "workflow_runs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "workflow_templates" (
    "id" UUID NOT NULL,
    "organization_id" UUID,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "trigger_type" "WorkflowTriggerType" NOT NULL DEFAULT 'manual',
    "trigger_config" JSONB NOT NULL DEFAULT '{}',
    "definition" JSONB NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "workflow_templates_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "workflow_templates_category_is_public_idx" ON "workflow_templates"("category", "is_public");

ALTER TABLE "workflow_templates" ADD CONSTRAINT "workflow_templates_organization_id_fkey"
  FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "workflows" ADD CONSTRAINT "workflows_template_id_fkey"
  FOREIGN KEY ("template_id") REFERENCES "workflow_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
