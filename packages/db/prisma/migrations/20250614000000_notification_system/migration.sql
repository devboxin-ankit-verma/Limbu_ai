-- Notification system: templates, push subscriptions, delivery tracking, job queue

CREATE TYPE "NotificationChannel" AS ENUM ('email', 'in_app', 'push', 'workflow');
CREATE TYPE "NotificationDeliveryStatus" AS ENUM ('queued', 'sent', 'delivered', 'failed', 'skipped');
CREATE TYPE "NotificationJobStatus" AS ENUM ('pending', 'processing', 'completed', 'failed');

ALTER TABLE "notifications" ADD COLUMN "event_type" TEXT;

CREATE TABLE "notification_templates" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT,
    "body_html" TEXT,
    "body_text" TEXT NOT NULL,
    "channels" JSONB NOT NULL DEFAULT '["in_app","email"]',
    "description" TEXT,
    "variables" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "notification_templates_key_key" ON "notification_templates"("key");

CREATE TABLE "push_subscriptions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth_key" TEXT NOT NULL,
    "user_agent" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "push_subscriptions_user_id_endpoint_key" ON "push_subscriptions"("user_id", "endpoint");
CREATE INDEX "push_subscriptions_user_id_idx" ON "push_subscriptions"("user_id");

CREATE TABLE "notification_deliveries" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "notification_id" UUID,
    "channel" "NotificationChannel" NOT NULL,
    "template_key" TEXT,
    "status" "NotificationDeliveryStatus" NOT NULL DEFAULT 'queued',
    "error" TEXT,
    "provider_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sent_at" TIMESTAMPTZ,

    CONSTRAINT "notification_deliveries_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "notification_deliveries_user_id_channel_created_at_idx" ON "notification_deliveries"("user_id", "channel", "created_at" DESC);
CREATE INDEX "notification_deliveries_status_created_at_idx" ON "notification_deliveries"("status", "created_at");

CREATE TABLE "notification_jobs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "event_type" TEXT NOT NULL,
    "channels" JSONB NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "NotificationJobStatus" NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 5,
    "scheduled_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMPTZ,
    "error" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_jobs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "notification_jobs_status_scheduled_at_idx" ON "notification_jobs"("status", "scheduled_at");

ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "notifications"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_template_key_fkey" FOREIGN KEY ("template_key") REFERENCES "notification_templates"("key") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "notification_jobs" ADD CONSTRAINT "notification_jobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed default templates
INSERT INTO "notification_templates" ("id", "key", "name", "subject", "body_html", "body_text", "channels", "description", "variables", "updated_at") VALUES
  (gen_random_uuid(), 'verify_email', 'Email verification', 'Verify your Limbu email', '<h2>Verify your email</h2><p>Click to verify: <a href="{{verifyUrl}}">Verify email</a></p>', 'Verify your email: {{verifyUrl}}', '["email"]', 'Sent when a user registers', '["verifyUrl"]', NOW()),
  (gen_random_uuid(), 'password_reset', 'Password reset', 'Reset your Limbu password', '<h2>Reset password</h2><p><a href="{{resetUrl}}">Reset password</a></p>', 'Reset your password: {{resetUrl}}', '["email"]', 'Sent for password reset requests', '["resetUrl"]', NOW()),
  (gen_random_uuid(), 'org_invitation', 'Organization invitation', 'You''ve been invited to {{organizationName}}', '<h2>Join {{organizationName}}</h2><p>{{inviterName}} invited you as {{role}}.</p><p><a href="{{inviteUrl}}">Accept invitation</a></p>', '{{inviterName}} invited you to {{organizationName}}. Accept: {{inviteUrl}}', '["email"]', 'Sent when inviting org members', '["organizationName","inviterName","role","inviteUrl"]', NOW()),
  (gen_random_uuid(), 'workflow_update', 'Workflow notification', '{{title}}', '<p><strong>{{title}}</strong></p><p>{{body}}</p>', '{{title}}\n\n{{body}}', '["in_app","email","push","workflow"]', 'Workflow run updates', '["title","body","workflowId","runId"]', NOW()),
  (gen_random_uuid(), 'billing_alert', 'Billing alert', '{{title}}', '<p><strong>{{title}}</strong></p><p>{{body}}</p>', '{{title}}\n\n{{body}}', '["in_app","email"]', 'Billing and subscription alerts', '["title","body"]', NOW()),
  (gen_random_uuid(), 'generic_alert', 'Generic alert', '{{title}}', '<p><strong>{{title}}</strong></p><p>{{body}}</p>', '{{title}}\n\n{{body}}', '["in_app","email","push"]', 'General product notifications', '["title","body","actionUrl"]', NOW());
