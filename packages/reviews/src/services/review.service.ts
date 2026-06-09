import { prisma, WorkspaceRole } from "@limbu/db";
import { hasPermission } from "@limbu/auth/rbac";
import { requireWorkspaceAccess } from "@limbu/workspace";
import { ReviewNotFoundError } from "../errors";
import type { ReviewContext } from "../types";

async function assertReviewPermission(ctx: ReviewContext, write?: boolean) {
  if (ctx.isSuperAdmin) return;
  const { orgRole, workspaceRole } = await requireWorkspaceAccess(
    ctx.workspaceId,
    ctx.userId,
    write ? WorkspaceRole.editor : WorkspaceRole.viewer,
  );
  const permission = write ? "content:edit" : "content:view";
  if (!hasPermission(permission, { orgRole, workspaceRole })) {
    throw new ReviewNotFoundError();
  }
}

function toReviewRecord(review: {
  id: string;
  rating: number;
  text: string | null;
  author: string | null;
  repliedAt: Date | null;
  createdAt: Date;
  reply: { content: string; status: string } | null;
}) {
  return {
    id: review.id,
    rating: review.rating,
    text: review.text,
    author: review.author,
    repliedAt: review.repliedAt?.toISOString() ?? null,
    createdAt: review.createdAt.toISOString(),
    reply: review.reply
      ? { content: review.reply.content, status: review.reply.status }
      : null,
  };
}

export async function listReviews(ctx: ReviewContext, filter?: string) {
  await assertReviewPermission(ctx);

  const where: Record<string, unknown> = {
    workspaceId: ctx.workspaceId,
    organizationId: ctx.organizationId,
  };

  if (filter === "pending") {
    where.repliedAt = null;
  } else if (filter === "replied") {
    where.repliedAt = { not: null };
  }

  const reviews = await prisma.review.findMany({
    where,
    include: { reply: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return reviews.map(toReviewRecord);
}

export async function getReview(reviewId: string, ctx: ReviewContext) {
  await assertReviewPermission(ctx);
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

  return toReviewRecord(review);
}

export async function getPendingReviewCount(ctx: ReviewContext) {
  return prisma.review.count({
    where: {
      workspaceId: ctx.workspaceId,
      organizationId: ctx.organizationId,
      repliedAt: null,
    },
  });
}

export async function getRecentReviews(ctx: ReviewContext, limit = 5) {
  const reviews = await prisma.review.findMany({
    where: {
      workspaceId: ctx.workspaceId,
      organizationId: ctx.organizationId,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    text: r.text,
    author: r.author,
    createdAt: r.createdAt.toISOString(),
  }));
}
