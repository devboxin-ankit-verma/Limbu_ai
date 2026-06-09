import { AiGenerationType, PlanTier, prisma } from "@limbu/db";
import { selectModel } from "@limbu/ai-core";
import { completeOpenAi } from "@limbu/ai-core/providers/openai";
import { ContentError } from "../errors";
import type { ContentContext } from "../types";

function fillTemplate(
  template: string,
  vars: Record<string, string>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? "");
}

export async function generatePostContent(
  ctx: ContentContext,
  input: { keywords: string; tone?: string; platform?: string },
) {
  const { assertAiCredits } = await import("@limbu/billing");
  await assertAiCredits(ctx.organizationId, 1);

  const prompt = await prisma.promptTemplate.findFirst({
    where: { name: "post_composer", isActive: true },
    orderBy: { version: "desc" },
  });

  const org = await prisma.organization.findUnique({
    where: { id: ctx.organizationId },
    select: { name: true, planTier: true },
  });

  const template =
    prompt?.template ??
    `Write a {{tone}} Google Business Profile post about: {{topic}} for {{business_name}}.`;

  const systemPrompt = fillTemplate(template, {
    business_name: org?.name ?? "the business",
    tone: input.tone ?? "professional and engaging",
    platform: input.platform ?? "Google Business Profile",
    topic: input.keywords,
    max_length: "1500",
  });

  const selection = selectModel({
    planTier: org?.planTier ?? PlanTier.free,
    taskType: AiGenerationType.post,
  });

  try {
    const result = await completeOpenAi({
      model: selection.primary,
      systemPrompt,
      messages: [{ role: "user", content: `Keywords: ${input.keywords}` }],
      maxOutputTokens: 800,
    });

    return {
      text: result.content.trim(),
      model: selection.primary.model,
      promptTokens: result.usage.promptTokens,
      completionTokens: result.usage.completionTokens,
    };
  } catch (err) {
    if (INTEGRATION_MOCK_FALLBACK) {
      return {
        text: `🚀 ${input.keywords} — Discover why customers love us! Visit today for exclusive offers. #LocalBusiness #${input.keywords.replace(/\s+/g, "")}`,
        model: "mock",
        promptTokens: 0,
        completionTokens: 0,
      };
    }
    throw new ContentError(
      err instanceof Error ? err.message : "AI generation failed",
      "AI_FAILED",
      502,
    );
  }
}

const INTEGRATION_MOCK_FALLBACK =
  process.env.INTEGRATION_MOCK_GOOGLE === "true" && !process.env.OPENAI_API_KEY;
