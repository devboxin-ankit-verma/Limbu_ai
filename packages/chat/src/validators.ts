import { z } from "zod";

export const createThreadSchema = z.object({
  title: z.string().max(200).optional(),
});

export const renameThreadSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
});

export const listThreadsSchema = z.object({
  search: z.string().max(200).optional(),
  archived: z.coerce.boolean().optional().default(false),
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
});

export const sendMessageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty").max(32000),
});

export const editMessageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty").max(32000),
});

export const listMessagesSchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(40),
});

export const pinThreadSchema = z.object({
  pinned: z.boolean(),
});

export const archiveThreadSchema = z.object({
  archived: z.boolean(),
});
