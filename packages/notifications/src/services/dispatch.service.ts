import {
  NotificationChannel,
  NotificationDeliveryStatus,
  prisma,
  type Prisma,
} from "@limbu/db";
import type { DispatchInput, DispatchResult } from "../types";
import { getEventDefinition } from "../events/catalog";
import { getEffectivePreference } from "./preference.service";
import { createInAppNotification } from "./notification.service";
import { renderNotificationTemplate } from "./template.service";
import { createDelivery } from "./delivery.service";

export async function dispatchNotification(input: DispatchInput): Promise<DispatchResult> {
  const eventDef = getEventDefinition(input.eventType);
  const prefs = input.skipPreferences
    ? { email: true, push: true, inApp: true }
    : await getEffectivePreference(input.userId, input.eventType);

  const templateKey = input.templateKey ?? eventDef.defaultTemplateKey;
  const channels = input.channels ?? eventDef.defaultChannels;
  const rendered = await renderNotificationTemplate(templateKey, input.payload);

  const result: DispatchResult = { notificationId: null, jobIds: [], deliveries: [] };
  const type = input.type ?? input.eventType;

  const wantsInApp =
    channels.includes(NotificationChannel.in_app) ||
    channels.includes(NotificationChannel.workflow);

  if (wantsInApp && prefs.inApp) {
    const notification = await createInAppNotification({
      userId: input.userId,
      type: channels.includes(NotificationChannel.workflow) ? "workflow" : type,
      eventType: input.eventType,
      payload: input.payload,
    });
    result.notificationId = notification.id;

    const delivery = await createDelivery({
      userId: input.userId,
      channel: channels.includes(NotificationChannel.workflow)
        ? NotificationChannel.workflow
        : NotificationChannel.in_app,
      notificationId: notification.id,
      templateKey,
      status: NotificationDeliveryStatus.delivered,
    });
    result.deliveries.push(delivery.id);
  } else if (wantsInApp) {
    const skipped = await createDelivery({
      userId: input.userId,
      channel: NotificationChannel.in_app,
      templateKey,
      status: NotificationDeliveryStatus.skipped,
      error: "User disabled in-app notifications",
    });
    result.deliveries.push(skipped.id);
  }

  const asyncChannels: NotificationChannel[] = [];
  if (channels.includes(NotificationChannel.email) && prefs.email) {
    asyncChannels.push(NotificationChannel.email);
  } else if (channels.includes(NotificationChannel.email)) {
    const skipped = await createDelivery({
      userId: input.userId,
      channel: NotificationChannel.email,
      templateKey,
      status: NotificationDeliveryStatus.skipped,
      error: "User disabled email notifications",
    });
    result.deliveries.push(skipped.id);
  }

  if (channels.includes(NotificationChannel.push) && prefs.push) {
    asyncChannels.push(NotificationChannel.push);
  } else if (channels.includes(NotificationChannel.push)) {
    const skipped = await createDelivery({
      userId: input.userId,
      channel: NotificationChannel.push,
      templateKey,
      status: NotificationDeliveryStatus.skipped,
      error: "User disabled push notifications",
    });
    result.deliveries.push(skipped.id);
  }

  if (asyncChannels.length > 0) {
    const job = await enqueueNotificationJob({
      userId: input.userId,
      eventType: input.eventType,
      channels: asyncChannels,
      payload: {
        ...input.payload,
        templateKey,
        rendered,
        emailTo: input.emailTo,
        notificationId: result.notificationId,
      },
    });
    result.jobIds.push(job.id);
  }

  return result;
}

export async function enqueueNotificationJob(input: {
  userId: string;
  eventType: string;
  channels: NotificationChannel[];
  payload: Record<string, unknown>;
  scheduledAt?: Date;
}) {
  const job = await prisma.notificationJob.create({
    data: {
      userId: input.userId,
      eventType: input.eventType,
      channels: input.channels as Prisma.InputJsonValue,
      payload: input.payload as Prisma.InputJsonValue,
      scheduledAt: input.scheduledAt ?? new Date(),
    },
  });

  return job;
}

/** Convenience helpers for auth/org transactional emails */
export async function sendTemplatedEmail(input: {
  userId: string;
  eventType: string;
  templateKey: string;
  emailTo: string;
  variables: Record<string, unknown>;
}) {
  return dispatchNotification({
    userId: input.userId,
    eventType: input.eventType,
    templateKey: input.templateKey,
    payload: {
      title: String(input.variables.title ?? input.templateKey),
      body: String(input.variables.body ?? ""),
      ...input.variables,
    },
    channels: [NotificationChannel.email],
    emailTo: input.emailTo,
    skipPreferences: true,
  });
}
