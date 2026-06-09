import { AiGenerationType, PlanTier, prisma, ReviewReplyStatus } from "@limbu/db";
import { selectModel } from "@limbu/ai-core";
import { completeOpenAi } from "@limbu/ai-core/providers/openai";
import { ReviewError, ReviewNotFoundError } from "../errors";
import type { ReviewContext } from "../types";

function fillTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? "");
}

export async function suggestReviewReply(reviewId: string, ctx: ReviewContext) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (
    !review ||
    review.workspaceId !== ctx.workspaceId ||
    review.organizationId !== ctx.organizationId
  ) {
    throw new ReviewNotFoundError();
  }

  const { assertAiCredits } = await import("@limbu/billing");
  await assertAiCredits(ctx.organizationId, 1);

  const org = await prisma.organization.findUnique({
    where: { id: ctx.organizationId },
    select: { name: true, planTier: true },
  });

  const prompt = await prisma.promptTemplate.findFirst({
    where: { name: "review_reply", isActive: true },
    orderBy: { version: "desc" },
  });

  const template =
    prompt?.template ??
    `Respond to a {{rating}}-star review for {{business_name}}. Review: "{{review_text}}"`;

  const systemPrompt = fillTemplate(template, {
    business_name: org?.name ?? "our business",
    rating: String(review.rating),
    review_text: review.text ?? "",
  });

  const selection = selectModel({
    planTier: org?.planTier ?? PlanTier.free,
    taskType: AiGenerationType.review_reply,
  });

  try {
    const result = await completeOpenAi({
      model: selection.primary,
      systemPrompt,
      messages: [{ role: "user", content: "Write the reply." }],
      maxOutputTokens: 400,
    });
    return { suggestion: result.content.trim() };
  } catch {
    const fallback =
      review.rating >= 4
        ? `Thank you so much for your wonderful ${review.rating}-star review! We truly appreciate your support and look forward to serving you again.`
        : `Thank you for your feedback. We're sorry your experience wasn't perfect and we'd love to make it right. Please reach out to us directly.`;
    return { suggestion: fallback };
  }
}

export async function publishReviewReply(
  reviewId: string,
  ctx: ReviewContext,
  content: string,
  aiGenerated = false,
) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { reply: true },
  });

  if (
    !review ||
    review.workspaceId !== ctx.workspaceId ||
    review.organizationId !== ctx.organizationId
  ) {
    throw new ReviewNotFoundError();
  }

  if (review.reply?.status === ReviewReplyStatus.published) {
    throw new ReviewError("Review already has a published reply", "ALREADY_REPLIED", 409);
  }

  const reply = await prisma.reviewReply.upsert({
    where: { reviewId },
    create: {
      reviewId,
      workspaceId: ctx.workspaceId,
      organizationId: ctx.organizationId,
      content,
      aiGenerated,
      status: ReviewReplyStatus.published,
      publishedAt: new Date(),
    },
    update: {
      content,
      aiGenerated,
      status: ReviewReplyStatus.published,
      publishedAt: new Date(),
    },
  });

  await prisma.review.update({
    where: { id: reviewId },
    data: { repliedAt: new Date() },
  });

  await prisma.auditLog.create({
    data: {
      organizationId: ctx.organizationId,
      actorId: ctx.userId,
      action: "review.reply.published",
      resourceType: "review",
      resourceId: reviewId,
      metadata: { aiGenerated },
    },
  });

  return { content: reply.content, status: reply.status };
}
