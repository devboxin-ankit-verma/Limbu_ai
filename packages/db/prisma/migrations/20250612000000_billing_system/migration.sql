-- Billing & Subscription System

-- PlanTier: add starter
ALTER TYPE "PlanTier" ADD VALUE IF NOT EXISTS 'starter';

-- New enums
CREATE TYPE "BillingInterval" AS ENUM ('monthly', 'annual');
CREATE TYPE "UsageMetricCategory" AS ENUM (
  'ai_tokens',
  'ai_credits',
  'storage_bytes',
  'knowledge_base_documents',
  'agent_runs',
  'workflow_runs'
);

-- CreditReferenceType extensions
ALTER TYPE "CreditReferenceType" ADD VALUE IF NOT EXISTS 'agent_run';
ALTER TYPE "CreditReferenceType" ADD VALUE IF NOT EXISTS 'workflow_run';
ALTER TYPE "CreditReferenceType" ADD VALUE IF NOT EXISTS 'storage';
ALTER TYPE "CreditReferenceType" ADD VALUE IF NOT EXISTS 'knowledge_base';

-- Subscription extensions
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "stripe_price_id" TEXT;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "billing_interval" "BillingInterval" NOT NULL DEFAULT 'monthly';
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "trial_end" TIMESTAMPTZ;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "coupon_id" TEXT;

-- Usage period summaries
CREATE TABLE IF NOT EXISTS "usage_period_summaries" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "organization_id" UUID NOT NULL,
  "period_start" TIMESTAMPTZ NOT NULL,
  "period_end" TIMESTAMPTZ NOT NULL,
  "category" "UsageMetricCategory" NOT NULL,
  "quantity" BIGINT NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "usage_period_summaries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "usage_period_summaries_organization_id_period_start_category_key"
  ON "usage_period_summaries"("organization_id", "period_start", "category");
CREATE INDEX IF NOT EXISTS "usage_period_summaries_organization_id_period_start_idx"
  ON "usage_period_summaries"("organization_id", "period_start");

ALTER TABLE "usage_period_summaries"
  ADD CONSTRAINT "usage_period_summaries_organization_id_fkey"
  FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Stripe webhook idempotency
CREATE TABLE IF NOT EXISTS "stripe_webhook_events" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "stripe_event_id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "processed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "payload" JSONB,
  CONSTRAINT "stripe_webhook_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "stripe_webhook_events_stripe_event_id_key"
  ON "stripe_webhook_events"("stripe_event_id");
CREATE INDEX IF NOT EXISTS "stripe_webhook_events_processed_at_idx"
  ON "stripe_webhook_events"("processed_at");
