import { NotificationDeliveryStatus, prisma } from "@limbu/db";
import webpush from "web-push";
import { NOTIFICATION_CONFIG } from "../config";
import { createDelivery, updateDeliveryStatus } from "../services/delivery.service";

export function getVapidPublicKey(): string | null {
  return NOTIFICATION_CONFIG.vapidPublicKey || null;
}

export function configureWebPush() {
  if (!NOTIFICATION_CONFIG.vapidPublicKey || !NOTIFICATION_CONFIG.vapidPrivateKey) return false;
  webpush.setVapidDetails(
    NOTIFICATION_CONFIG.vapidSubject,
    NOTIFICATION_CONFIG.vapidPublicKey,
    NOTIFICATION_CONFIG.vapidPrivateKey,
  );
  return true;
}

export async function subscribePush(input: {
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string;
}) {
  return prisma.pushSubscription.upsert({
    where: {
      userId_endpoint: { userId: input.userId, endpoint: input.endpoint },
    },
    create: {
      userId: input.userId,
      endpoint: input.endpoint,
      p256dh: input.p256dh,
      authKey: input.auth,
      userAgent: input.userAgent,
    },
    update: {
      p256dh: input.p256dh,
      authKey: input.auth,
      userAgent: input.userAgent,
    },
  });
}

export async function unsubscribePush(userId: string, endpoint: string) {
  await prisma.pushSubscription.deleteMany({ where: { userId, endpoint } });
  return { removed: true };
}

export async function sendPushNotification(input: {
  userId: string;
  title: string;
  body: string;
  actionUrl?: string;
  templateKey?: string;
  notificationId?: string;
}) {
  const subscriptions = await prisma.pushSubscription.findMany({ where: { userId: input.userId } });
  if (subscriptions.length === 0) {
    const skipped = await createDelivery({
      userId: input.userId,
      channel: "push",
      notificationId: input.notificationId,
      templateKey: input.templateKey,
      status: NotificationDeliveryStatus.skipped,
      error: "No push subscriptions",
    });
    return { sent: 0, deliveryId: skipped.id };
  }

  const delivery = await createDelivery({
    userId: input.userId,
    channel: "push",
    notificationId: input.notificationId,
    templateKey: input.templateKey,
    status: NotificationDeliveryStatus.queued,
  });

  if (NOTIFICATION_CONFIG.mockPush || !configureWebPush()) {
    await updateDeliveryStatus(delivery.id, NotificationDeliveryStatus.sent, {
      providerId: "mock",
    });
    return { sent: subscriptions.length, deliveryId: delivery.id };
  }

  const payload = JSON.stringify({
    title: input.title,
    body: input.body,
    url: input.actionUrl,
  });

  let sent = 0;
  let lastError: string | undefined;

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.authKey },
        },
        payload,
      );
      sent += 1;
    } catch (err) {
      lastError = err instanceof Error ? err.message : "Push failed";
      if (String(lastError).includes("410") || String(lastError).includes("404")) {
        await prisma.pushSubscription.delete({ where: { id: sub.id } });
      }
    }
  }

  if (sent > 0) {
    await updateDeliveryStatus(delivery.id, NotificationDeliveryStatus.sent, {
      providerId: `${sent}/${subscriptions.length}`,
    });
  } else {
    await updateDeliveryStatus(delivery.id, NotificationDeliveryStatus.failed, {
      error: lastError ?? "All push deliveries failed",
    });
  }

  return { sent, deliveryId: delivery.id };
}
