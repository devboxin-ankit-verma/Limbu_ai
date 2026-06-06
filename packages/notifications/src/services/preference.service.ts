import { prisma } from "@limbu/db";
import type { PreferenceRow } from "../types";
import { ALL_EVENT_TYPES, getEventDefinition } from "../events/catalog";

export async function getUserPreferences(userId: string): Promise<PreferenceRow[]> {
  await seedDefaultPreferences(userId);
  const rows = await prisma.notificationPreference.findMany({
    where: { userId },
    orderBy: { eventType: "asc" },
  });

  return rows.map((r) => {
    const def = getEventDefinition(r.eventType);
    return {
      eventType: r.eventType,
      label: def.label,
      description: def.description,
      email: r.email,
      push: r.push,
      inApp: r.inApp,
    };
  });
}

export async function getEffectivePreference(userId: string, eventType: string) {
  await seedDefaultPreferences(userId);
  const pref = await prisma.notificationPreference.findUnique({
    where: { userId_eventType: { userId, eventType } },
  });
  const def = getEventDefinition(eventType);
  return {
    email: pref?.email ?? def.defaultEmail,
    push: pref?.push ?? def.defaultPush,
    inApp: pref?.inApp ?? def.defaultInApp,
  };
}

export async function updateUserPreference(
  userId: string,
  input: { eventType: string; email?: boolean; push?: boolean; inApp?: boolean },
) {
  await seedDefaultPreferences(userId);
  return prisma.notificationPreference.upsert({
    where: { userId_eventType: { userId, eventType: input.eventType } },
    create: {
      userId,
      eventType: input.eventType,
      email: input.email ?? true,
      push: input.push ?? true,
      inApp: input.inApp ?? true,
    },
    update: {
      ...(input.email !== undefined ? { email: input.email } : {}),
      ...(input.push !== undefined ? { push: input.push } : {}),
      ...(input.inApp !== undefined ? { inApp: input.inApp } : {}),
    },
  });
}

export async function seedDefaultPreferences(userId: string) {
  const existing = await prisma.notificationPreference.count({ where: { userId } });
  if (existing >= ALL_EVENT_TYPES.length) return;

  for (const eventType of ALL_EVENT_TYPES) {
    const def = getEventDefinition(eventType);
    await prisma.notificationPreference.upsert({
      where: { userId_eventType: { userId, eventType } },
      create: {
        userId,
        eventType,
        email: def.defaultEmail,
        push: def.defaultPush,
        inApp: def.defaultInApp,
      },
      update: {},
    });
  }
}
