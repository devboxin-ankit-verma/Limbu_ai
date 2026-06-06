import { z } from "zod";

export const trackEventSchema = z.object({
  eventName: z.string().min(1).max(128),
  organizationId: z.string().uuid().optional(),
  workspaceId: z.string().uuid().optional(),
  properties: z.record(z.unknown()).optional(),
});

export const analyticsQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30),
});

export const recordErrorSchema = z.object({
  source: z.string().min(1).max(128),
  message: z.string().min(1).max(4000),
  code: z.string().max(128).optional(),
  stack: z.string().max(8000).optional(),
  severity: z.enum(["debug", "info", "warning", "error", "critical"]).default("error"),
  organizationId: z.string().uuid().optional(),
  workspaceId: z.string().uuid().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const recordMetricSchema = z.object({
  name: z.string().min(1).max(128),
  value: z.number(),
  unit: z.string().max(32).default("ms"),
  organizationId: z.string().uuid().optional(),
  workspaceId: z.string().uuid().optional(),
  tags: z.record(z.unknown()).optional(),
});

/** Standard product event names */
export const PRODUCT_EVENTS = {
  PAGE_VIEW: "page.view",
  CHAT_MESSAGE_SENT: "chat.message.sent",
  CHAT_THREAD_CREATED: "chat.thread.created",
  WORKFLOW_RUN: "workflow.run",
  WORKFLOW_CREATED: "workflow.created",
  AGENT_RUN: "agent.run",
  KNOWLEDGE_UPLOAD: "knowledge.document.upload",
  KNOWLEDGE_SEARCH: "knowledge.search",
  BILLING_CHECKOUT: "billing.checkout",
} as const;
