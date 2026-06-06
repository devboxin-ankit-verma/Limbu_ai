import { AgentMessageType, prisma, type Prisma } from "@limbu/db";
import type { AgentMessageRecord, BuiltinAgentKey } from "../types";

export class AgentBus {
  constructor(private readonly runId: string) {}

  async send(input: {
    from: BuiltinAgentKey | string;
    to?: BuiltinAgentKey | string | null;
    type: AgentMessageType;
    content: string;
    metadata?: Record<string, unknown>;
  }): Promise<AgentMessageRecord> {
    const message = await prisma.agentRunMessage.create({
      data: {
        runId: this.runId,
        fromAgentKey: input.from,
        toAgentKey: input.to ?? null,
        messageType: input.type,
        content: input.content,
        metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });

    return {
      id: message.id,
      runId: message.runId,
      fromAgentKey: message.fromAgentKey,
      toAgentKey: message.toAgentKey,
      messageType: message.messageType,
      content: message.content,
      createdAt: message.createdAt,
    };
  }

  async delegate(from: BuiltinAgentKey, to: BuiltinAgentKey, task: string) {
    return this.send({
      from,
      to,
      type: AgentMessageType.delegate,
      content: task,
    });
  }

  async respond(from: BuiltinAgentKey, to: BuiltinAgentKey, content: string) {
    return this.send({
      from,
      to,
      type: AgentMessageType.response,
      content,
    });
  }

  async handoff(from: BuiltinAgentKey, to: BuiltinAgentKey, context: string) {
    return this.send({
      from,
      to,
      type: AgentMessageType.handoff,
      content: context,
    });
  }

  async listMessages(): Promise<AgentMessageRecord[]> {
    const messages = await prisma.agentRunMessage.findMany({
      where: { runId: this.runId },
      orderBy: { createdAt: "asc" },
    });
    return messages.map((m) => ({
      id: m.id,
      runId: m.runId,
      fromAgentKey: m.fromAgentKey,
      toAgentKey: m.toAgentKey,
      messageType: m.messageType,
      content: m.content,
      createdAt: m.createdAt,
    }));
  }
}
