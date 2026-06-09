import { randomBytes } from "node:crypto";
import {
  PostStatus,
  PublishChannel,
  PublishJobStatus,
  prisma,
  type Prisma,
} from "@limbu/db";
import { assertContentPermission, requirePostAccess } from "../access";
import type { ContentContext, PostContent } from "../types";
import { generatePostContent } from "./generate.service";

function toPostRecord(post: {
  id: string;
  status: string;
  channels: PublishChannel[];
  scheduledAt: Date | null;
  publishedAt: Date | null;
  content: unknown;
  createdAt: Date;
}) {
  return {
    id: post.id,
    status: post.status,
    channels: post.channels,
    scheduledAt: post.scheduledAt?.toISOString() ?? null,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    content: (post.content ?? {}) as PostContent,
    createdAt: post.createdAt.toISOString(),
  };
}

export async function listPosts(ctx: ContentContext, filter?: { status?: string }) {
  await assertContentPermission(ctx);
  const posts = await prisma.post.findMany({
    where: {
      workspaceId: ctx.workspaceId,
      organizationId: ctx.organizationId,
      deletedAt: null,
      ...(filter?.status ? { status: filter.status as PostStatus } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return posts.map(toPostRecord);
}

export async function createPost(
  ctx: ContentContext,
  input: { content: PostContent; channels?: PublishChannel[] },
) {
  await assertContentPermission(ctx, true);

  const { assertFeature } = await import("@limbu/billing");
  await assertFeature(ctx.organizationId, "gmb_publishing");

  const { assertPostQuota } = await import("../gating");
  await assertPostQuota(ctx.organizationId);

  const post = await prisma.post.create({
    data: {
      workspaceId: ctx.workspaceId,
      organizationId: ctx.organizationId,
      createdById: ctx.userId,
      content: input.content as Prisma.InputJsonValue,
      channels: input.channels ?? [PublishChannel.gbp],
      status: PostStatus.draft,
    },
  });

  await prisma.postVersion.create({
    data: {
      postId: post.id,
      workspaceId: ctx.workspaceId,
      organizationId: ctx.organizationId,
      version: 1,
      content: input.content as Prisma.InputJsonValue,
      editedById: ctx.userId,
    },
  });

  return toPostRecord(post);
}

export async function getPost(postId: string, ctx: ContentContext) {
  const post = await requirePostAccess(postId, ctx);
  return toPostRecord(post);
}

export async function updatePost(
  postId: string,
  ctx: ContentContext,
  input: { content?: PostContent; status?: PostStatus },
) {
  const post = await requirePostAccess(postId, ctx, true);

  const updated = await prisma.post.update({
    where: { id: post.id },
    data: {
      ...(input.content ? { content: input.content as Prisma.InputJsonValue } : {}),
      ...(input.status ? { status: input.status } : {}),
    },
  });

  if (input.content) {
    const lastVersion = await prisma.postVersion.findFirst({
      where: { postId: post.id },
      orderBy: { version: "desc" },
    });
    await prisma.postVersion.create({
      data: {
        postId: post.id,
        workspaceId: ctx.workspaceId,
        organizationId: ctx.organizationId,
        version: (lastVersion?.version ?? 0) + 1,
        content: input.content as Prisma.InputJsonValue,
        editedById: ctx.userId,
      },
    });
  }

  return toPostRecord(updated);
}

export async function deletePost(postId: string, ctx: ContentContext) {
  await requirePostAccess(postId, ctx, true);
  await prisma.post.update({
    where: { id: postId },
    data: { deletedAt: new Date(), status: PostStatus.cancelled },
  });
}

export async function generateAndUpdatePost(
  postId: string,
  ctx: ContentContext,
  input: { keywords: string; tone?: string },
) {
  const post = await requirePostAccess(postId, ctx, true);
  const generated = await generatePostContent(ctx, input);
  const content: PostContent = {
    text: generated.text,
    keywords: input.keywords,
    tone: input.tone,
  };
  return updatePost(post.id, ctx, { content });
}

export async function schedulePost(postId: string, ctx: ContentContext, scheduledAt: Date) {
  const post = await requirePostAccess(postId, ctx, true);

  const updated = await prisma.post.update({
    where: { id: post.id },
    data: { scheduledAt, status: PostStatus.scheduled },
  });

  for (const channel of post.channels) {
    await prisma.publishJob.upsert({
      where: { idempotencyKey: `schedule:${post.id}:${channel}` },
      create: {
        postId: post.id,
        workspaceId: ctx.workspaceId,
        organizationId: ctx.organizationId,
        channel,
        idempotencyKey: `schedule:${post.id}:${channel}`,
        status: PublishJobStatus.pending,
        scheduledAt,
      },
      update: { scheduledAt, status: PublishJobStatus.pending },
    });
  }

  return toPostRecord(updated);
}

export async function publishPostNow(postId: string, ctx: ContentContext) {
  const post = await requirePostAccess(postId, ctx, true);
  const scheduledAt = new Date();

  await prisma.post.update({
    where: { id: post.id },
    data: { scheduledAt, status: PostStatus.scheduled },
  });

  for (const channel of post.channels) {
    await prisma.publishJob.create({
      data: {
        postId: post.id,
        workspaceId: ctx.workspaceId,
        organizationId: ctx.organizationId,
        channel,
        idempotencyKey: `publish:${post.id}:${channel}:${randomBytes(4).toString("hex")}`,
        status: PublishJobStatus.pending,
        scheduledAt,
      },
    });
  }

  return toPostRecord(
    await prisma.post.findUniqueOrThrow({ where: { id: post.id } }),
  );
}

export async function getCalendarPosts(ctx: ContentContext, from: Date, to: Date) {
  await assertContentPermission(ctx);
  const posts = await prisma.post.findMany({
    where: {
      workspaceId: ctx.workspaceId,
      organizationId: ctx.organizationId,
      deletedAt: null,
      scheduledAt: { gte: from, lte: to },
    },
    orderBy: { scheduledAt: "asc" },
  });
  return posts.map(toPostRecord);
}

export async function getDashboardPostStats(ctx: ContentContext) {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const postsThisWeek = await prisma.post.count({
    where: {
      workspaceId: ctx.workspaceId,
      organizationId: ctx.organizationId,
      deletedAt: null,
      createdAt: { gte: weekAgo },
    },
  });

  const upcomingPosts = await prisma.post.findMany({
    where: {
      workspaceId: ctx.workspaceId,
      organizationId: ctx.organizationId,
      deletedAt: null,
      status: PostStatus.scheduled,
      scheduledAt: { gte: new Date() },
    },
    orderBy: { scheduledAt: "asc" },
    take: 5,
  });

  return {
    postsThisWeek,
    upcomingPosts: upcomingPosts.map((p) => ({
      id: p.id,
      scheduledAt: p.scheduledAt!.toISOString(),
      preview: ((p.content as PostContent)?.text ?? "").slice(0, 80),
    })),
  };
}
