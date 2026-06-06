-- Multi-agent system extensions

CREATE TYPE "AgentMessageType" AS ENUM ('delegate', 'request', 'response', 'handoff', 'system');
CREATE TYPE "BuiltinAgentKey" AS ENUM ('supervisor', 'research', 'coding', 'content', 'analytics');

ALTER TABLE "agents" ADD COLUMN "description" TEXT;
ALTER TABLE "agents" ADD COLUMN "agent_key" TEXT;
ALTER TABLE "agents" ADD COLUMN "knowledge_scopes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

CREATE INDEX "agents_workspace_id_agent_key_idx" ON "agents"("workspace_id", "agent_key");

ALTER TABLE "agent_runs" ADD COLUMN "user_id" UUID;
ALTER TABLE "agent_runs" ADD COLUMN "task" TEXT;
ALTER TABLE "agent_runs" ADD COLUMN "current_agent_key" TEXT;
ALTER TABLE "agent_runs" ADD COLUMN "routing" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "agent_runs" ADD COLUMN "input" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "agent_runs" ADD COLUMN "output" JSONB;
ALTER TABLE "agent_runs" ALTER COLUMN "agent_id" DROP NOT NULL;

CREATE INDEX "agent_runs_user_id_started_at_idx" ON "agent_runs"("user_id", "started_at");

ALTER TABLE "agent_runs" ADD CONSTRAINT "agent_runs_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "agent_run_messages" (
    "id" UUID NOT NULL,
    "run_id" UUID NOT NULL,
    "from_agent_key" TEXT NOT NULL,
    "to_agent_key" TEXT,
    "message_type" "AgentMessageType" NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_run_messages_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "agent_run_messages_run_id_created_at_idx" ON "agent_run_messages"("run_id", "created_at");

ALTER TABLE "agent_run_messages" ADD CONSTRAINT "agent_run_messages_run_id_fkey"
  FOREIGN KEY ("run_id") REFERENCES "agent_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "agent_memory_entries" (
    "id" UUID NOT NULL,
    "run_id" UUID NOT NULL,
    "agent_key" TEXT NOT NULL,
    "memory_key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "agent_memory_entries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "agent_memory_entries_run_id_agent_key_memory_key_key"
  ON "agent_memory_entries"("run_id", "agent_key", "memory_key");
CREATE INDEX "agent_memory_entries_run_id_agent_key_idx" ON "agent_memory_entries"("run_id", "agent_key");

ALTER TABLE "agent_memory_entries" ADD CONSTRAINT "agent_memory_entries_run_id_fkey"
  FOREIGN KEY ("run_id") REFERENCES "agent_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
