import { prisma } from "@limbu/db";
import type { NotificationChannel } from "@limbu/db";
import type { TemplateRow } from "../types";
import { NotificationNotFoundError } from "../errors";
import { renderTemplate } from "../templates/render";

export async function getTemplate(key: string) {
  const template = await prisma.notificationTemplate.findUnique({ where: { key } });
  if (!template) throw new NotificationNotFoundError(`Template '${key}' not found`);
  return template;
}

export async function listTemplates(): Promise<TemplateRow[]> {
  const rows = await prisma.notificationTemplate.findMany({ orderBy: { key: "asc" } });
  return rows.map((t) => ({
    key: t.key,
    name: t.name,
    subject: t.subject,
    channels: t.channels as NotificationChannel[],
    description: t.description,
  }));
}

export async function renderNotificationTemplate(
  templateKey: string,
  variables: Record<string, unknown>,
) {
  const template = await getTemplate(templateKey);
  return {
    subject: template.subject ? renderTemplate(template.subject, variables) : undefined,
    bodyHtml: template.bodyHtml
      ? renderTemplate(template.bodyHtml, variables)
      : undefined,
    bodyText: renderTemplate(template.bodyText, variables),
    channels: template.channels as NotificationChannel[],
  };
}
