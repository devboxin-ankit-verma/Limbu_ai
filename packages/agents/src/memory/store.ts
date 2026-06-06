import { prisma } from "@limbu/db";
import type { AgentMemoryRecord, BuiltinAgentKey } from "../types";

export class AgentMemoryStore {
  constructor(private readonly runId: string) {}

  async get(agentKey: BuiltinAgentKey | string, memoryKey: string): Promise<string | null> {
    const entry = await prisma.agentMemoryEntry.findUnique({
      where: {
        runId_agentKey_memoryKey: { runId: this.runId, agentKey, memoryKey },
      },
    });
    return entry?.value ?? null;
  }

  async set(agentKey: BuiltinAgentKey | string, memoryKey: string, value: string) {
    await prisma.agentMemoryEntry.upsert({
      where: {
        runId_agentKey_memoryKey: { runId: this.runId, agentKey, memoryKey },
      },
      create: { runId: this.runId, agentKey, memoryKey, value },
      update: { value },
    });
  }

  async patch(agentKey: BuiltinAgentKey | string, entries: Record<string, string>) {
    await Promise.all(
      Object.entries(entries).map(([memoryKey, value]) =>
        this.set(agentKey, memoryKey, value),
      ),
    );
  }

  async getAll(agentKey?: BuiltinAgentKey | string): Promise<AgentMemoryRecord[]> {
    const entries = await prisma.agentMemoryEntry.findMany({
      where: {
        runId: this.runId,
        ...(agentKey ? { agentKey } : {}),
      },
      orderBy: { updatedAt: "desc" },
    });
    return entries.map((e) => ({
      agentKey: e.agentKey,
      memoryKey: e.memoryKey,
      value: e.value,
    }));
  }

  async toPromptBlock(agentKey: BuiltinAgentKey | string): Promise<string | undefined> {
    const entries = await this.getAll(agentKey);
    if (entries.length === 0) return undefined;
    return entries
      .map((e) => `- ${e.memoryKey}: ${e.value}`)
      .join("\n");
  }
}
