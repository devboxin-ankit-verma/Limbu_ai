import {
  NotificationChannel,
  NotificationJobStatus,
  prisma,
} from "@limbu/db";
import { sendEmailNotification } from "@limbu/notifications";
import { sendPushNotification } from "@limbu/notifications";

export async function processPendingNotificationJobs(limit = 25) {
  const batchSize = limit ?? Number(process.env.NOTIFICATION_WORKER_BATCH_SIZE ?? 25);
  const jobs = await prisma.notificationJob.findMany({
    where: {
      status: NotificationJobStatus.pending,
      scheduledAt: { lte: new Date() },
    },
    orderBy: { scheduledAt: "asc" },
    take: batchSize,
  });

  let processed = 0;
  for (const job of jobs) {
    const claimed = await prisma.notificationJob.updateMany({
      where: { id: job.id, status: NotificationJobStatus.pending },
      data: { status: NotificationJobStatus.processing, attempts: { increment: 1 } },
    });
    if (claimed.count === 0) continue;

    try {
      await processNotificationJob(job.id);
      processed += 1;
    } catch {
      // handled in processNotificationJob
    }
  }

  return { processed };
}

async function processNotificationJob(jobId: string) {
  const job = await prisma.notificationJob.findUnique({ where: { id: jobId } });
  if (!job) return;

  const channels = job.channels as NotificationChannel[];
  const payload = job.payload as Record<string, unknown>;
  const rendered = payload.rendered as {
    subject?: string;
    bodyHtml?: string;
    bodyText: string;
  };
  const templateKey = String(payload.templateKey ?? "generic_alert");
  const notificationId = payload.notificationId as string | undefined;

  try {
    const user = await prisma.user.findUnique({
      where: { id: job.userId },
      select: { email: true },
    });
    if (!user) throw new Error("User not found");

    for (const channel of channels) {
      if (channel === NotificationChannel.email) {
        const to = (payload.emailTo as string | undefined) ?? user.email;
        await sendEmailNotification({
          userId: job.userId,
          to,
          templateKey,
          subject: rendered?.subject,
          bodyHtml: rendered?.bodyHtml,
          bodyText: rendered?.bodyText ?? String(payload.body ?? ""),
          notificationId,
        });
      }

      if (channel === NotificationChannel.push) {
        await sendPushNotification({
          userId: job.userId,
          title: String(payload.title ?? "Limbu"),
          body: String(payload.body ?? ""),
          actionUrl: payload.actionUrl as string | undefined,
          templateKey,
          notificationId,
        });
      }
    }

    await prisma.notificationJob.update({
      where: { id: jobId },
      data: { status: NotificationJobStatus.completed, processedAt: new Date() },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Job failed";
    const attempts = job.attempts + 1;
    const failed = attempts >= job.maxAttempts;

    await prisma.notificationJob.update({
      where: { id: jobId },
      data: {
        status: failed ? NotificationJobStatus.failed : NotificationJobStatus.pending,
        error: message,
        processedAt: failed ? new Date() : null,
        scheduledAt: failed ? job.scheduledAt : new Date(Date.now() + attempts * 60000),
      },
    });

    if (failed) throw err;
  }
}

let draining = false;

export async function drainNotificationQueue() {
  if (draining) return;
  draining = true;
  try {
    await processPendingNotificationJobs(5);
  } catch {
    // best-effort inline drain
  } finally {
    draining = false;
  }
}
