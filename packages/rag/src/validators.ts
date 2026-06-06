import { KnowledgeBaseScope } from "@limbu/db";
import { z } from "zod";

export const createKnowledgeBaseSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).optional(),
  scope: z.nativeEnum(KnowledgeBaseScope),
  workspaceId: z.string().uuid().optional(),
});

export const updateKnowledgeBaseSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
});

export const searchKnowledgeSchema = z.object({
  query: z.string().trim().min(1).max(2000),
  knowledgeBaseIds: z.array(z.string().uuid()).optional(),
  scopes: z.array(z.nativeEnum(KnowledgeBaseScope)).optional(),
  topK: z.number().int().min(1).max(20).optional(),
  hybrid: z.boolean().optional(),
});

export const listDocumentsSchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  status: z.string().optional(),
});
