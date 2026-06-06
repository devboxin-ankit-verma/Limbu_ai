import { z } from "zod";

const agentKeySchema = z.enum(["supervisor", "research", "coding", "content", "analytics"]);

export const startAgentRunSchema = z.object({
  task: z.string().trim().min(1).max(8000),
  agentKey: agentKeySchema.optional(),
  threadId: z.string().uuid().optional(),
  input: z.record(z.unknown()).optional(),
  maxDelegations: z.number().int().min(1).max(5).optional(),
});

export const listAgentRunsSchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.number().int().min(1).max(50).optional(),
});
