import { AiGenerationType, prisma, type Prisma } from "@limbu/db";
import { CreditReferenceType } from "@limbu/db";
import { calculateUsageCost } from "./pricing";
import type { AiStreamUsage, ModelConfig } from "../types";

export async function recordGenerationUsage(input: {
  workspaceId: string;
  organizationId: string;
  model: ModelConfig;
  taskType: AiGenerationType;
  promptTokens: number;
  completionTokens: number;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  referenceId?: string;
}): Promise<AiStreamUsage> {
  const { costUsd, credits, totalTokens } = calculateUsageCost(
    input.model,
    input.promptTokens,
    input.completionTokens,
  );

  await prisma.$transaction(async (tx) => {
    await tx.aiGeneration.create({
      data: {
        workspaceId: input.workspaceId,
        organizationId: input.organizationId,
        type: input.taskType,
        model: input.model.model,
        credits,
        input: input.input as Prisma.InputJsonValue,
        output: input.output as Prisma.InputJsonValue,
        moderationPassed: true,
      },
    });

    await tx.aiUsageRecord.create({
      data: {
        organizationId: input.organizationId,
        type: input.taskType,
        credits,
        model: input.model.model,
        costUsd,
        referenceId: input.referenceId,
      },
    });
  });

  const { consumeCredits, trackAiTokenUsage } = await import("@limbu/billing");
  await consumeCredits({
    organizationId: input.organizationId,
    amount: credits,
    referenceType: CreditReferenceType.ai_generation,
    referenceId: input.referenceId,
    reason: `${input.taskType} generation`,
  });
  await trackAiTokenUsage({
    organizationId: input.organizationId,
    tokens: totalTokens,
    credits,
    referenceId: input.referenceId,
  });

  return {
    provider: input.model.provider,
    model: input.model.model,
    promptTokens: input.promptTokens,
    completionTokens: input.completionTokens,
    totalTokens,
    costUsd,
    credits,
  };
}
