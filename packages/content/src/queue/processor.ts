import { PostStatus, PublishJobStatus, prisma } from "@limbu/db";
import { INTEGRATION_CONFIG } from "@limbu/integrations";

export async function processPublishJobs(batchSize = 10) {
  const jobs = await prisma.publishJob.findMany({
    where: {
      status: PublishJobStatus.pending,
      scheduledAt: { lte: new Date() },
    },
    take: batchSize,
    orderBy: { scheduledAt: "asc" },
    include: { post: true },
  });

  let processed = 0;

  for (const job of jobs) {
    try {
      await prisma.publishJob.update({
        where: { id: job.id },
        data: { status: PublishJobStatus.processing, attempts: { increment: 1 } },
      });

      const externalId = INTEGRATION_CONFIG.mockGoogle
        ? `mock-gbp-${job.id.slice(0, 8)}`
        : `gbp-${Date.now()}`;

      await prisma.publishJob.update({
        where: { id: job.id },
        data: {
          status: PublishJobStatus.completed,
          externalId,
        },
      });

      const allJobs = await prisma.publishJob.findMany({
        where: { postId: job.postId },
      });
      const allDone = allJobs.every((j) => j.status === PublishJobStatus.completed);

      if (allDone) {
        await prisma.post.update({
          where: { id: job.postId },
          data: {
            status: PostStatus.published,
            publishedAt: new Date(),
          },
        });

        await prisma.postAnalytics.create({
          data: {
            postId: job.postId,
            workspaceId: job.workspaceId,
            organizationId: job.organizationId,
            channel: job.channel,
            impressions: Math.floor(Math.random() * 500) + 50,
            clicks: Math.floor(Math.random() * 50) + 5,
          },
        });
      }

      processed++;
    } catch (err) {
      const attempts = job.attempts + 1;
      await prisma.publishJob.update({
        where: { id: job.id },
        data: {
          status: attempts >= 3 ? PublishJobStatus.dead_letter : PublishJobStatus.failed,
          lastError: err instanceof Error ? err.message : "Publish failed",
        },
      });

      if (attempts >= 3) {
        await prisma.jobDeadLetter.create({
          data: {
            queueName: "publish_jobs",
            jobId: job.id,
            workspaceId: job.workspaceId,
            organizationId: job.organizationId,
            payload: { postId: job.postId, channel: job.channel },
            error: err instanceof Error ? err.message : "Publish failed",
          },
        });
      }
    }
  }

  return processed;
}
