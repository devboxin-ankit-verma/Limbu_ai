import { EmailDeliveryStatus, NotificationDeliveryStatus, prisma } from "@limbu/db";
import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { NOTIFICATION_CONFIG } from "../config";
import { createDelivery, logEmailDelivery, updateDeliveryStatus } from "../services/delivery.service";
import { wrapEmailHtml } from "../templates/render";

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST ?? "localhost",
      port: Number(process.env.SMTP_PORT ?? 1025),
      secure: process.env.SMTP_SECURE === "true",
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
    });
  }
  return transporter;
}

export async function sendEmailNotification(input: {
  userId: string;
  to: string;
  templateKey: string;
  subject?: string;
  bodyHtml?: string;
  bodyText: string;
  notificationId?: string;
  metadata?: Record<string, unknown>;
}) {
  const delivery = await createDelivery({
    userId: input.userId,
    channel: "email",
    notificationId: input.notificationId,
    templateKey: input.templateKey,
    status: NotificationDeliveryStatus.queued,
    metadata: input.metadata,
  });

  const emailLog = await logEmailDelivery({
    userId: input.userId,
    template: input.templateKey,
    status: EmailDeliveryStatus.queued,
  });

  if (NOTIFICATION_CONFIG.mockEmail) {
    await Promise.all([
      updateDeliveryStatus(delivery.id, NotificationDeliveryStatus.sent, {
        providerId: "mock",
      }),
      prisma.emailDelivery.update({
        where: { id: emailLog.id },
        data: { status: EmailDeliveryStatus.sent, providerId: "mock" },
      }),
    ]);
    return { deliveryId: delivery.id, providerId: "mock" };
  }

  try {
    const info = await getTransporter().sendMail({
      from: NOTIFICATION_CONFIG.emailFrom,
      to: input.to,
      subject: input.subject ?? "Notification from Limbu",
      text: input.bodyText,
      html: input.bodyHtml ? wrapEmailHtml(input.bodyHtml) : undefined,
    });

    await Promise.all([
      updateDeliveryStatus(delivery.id, NotificationDeliveryStatus.sent, {
        providerId: info.messageId,
      }),
      prisma.emailDelivery.update({
        where: { id: emailLog.id },
        data: { status: EmailDeliveryStatus.sent, providerId: info.messageId },
      }),
    ]);

    return { deliveryId: delivery.id, providerId: info.messageId };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Email send failed";
    await Promise.all([
      updateDeliveryStatus(delivery.id, NotificationDeliveryStatus.failed, { error: message }),
      prisma.emailDelivery.update({
        where: { id: emailLog.id },
        data: { status: EmailDeliveryStatus.failed },
      }),
    ]);
    throw err;
  }
}
