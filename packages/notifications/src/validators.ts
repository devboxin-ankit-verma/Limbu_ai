import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  unreadOnly: z.coerce.boolean().optional(),
});

export const updatePreferenceSchema = z.object({
  eventType: z.string().min(1).max(128),
  email: z.boolean().optional(),
  push: z.boolean().optional(),
  inApp: z.boolean().optional(),
});

export const pushSubscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
  userAgent: z.string().max(500).optional(),
});

export const dispatchSchema = z.object({
  userId: z.string().uuid(),
  eventType: z.string().min(1).max(128),
  templateKey: z.string().max(128).optional(),
  payload: z.record(z.unknown()),
  channels: z.array(z.enum(["email", "in_app", "push", "workflow"])).optional(),
  emailTo: z.string().email().optional(),
  skipPreferences: z.boolean().optional(),
});
