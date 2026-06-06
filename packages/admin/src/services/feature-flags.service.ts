import { prisma } from "@limbu/db";
import type { AdminFeatureFlagRow } from "../types";
import { AdminNotFoundError } from "../errors";
import { writeAdminAuditLog } from "../audit";

export async function listFeatureFlags(): Promise<AdminFeatureFlagRow[]> {
  const flags = await prisma.featureFlag.findMany({
    orderBy: { key: "asc" },
    include: { _count: { select: { overrides: true } } },
  });

  return flags.map((f) => ({
    key: f.key,
    defaultValue: f.defaultValue,
    description: f.description,
    overrideCount: f._count.overrides,
  }));
}

export async function updateFeatureFlag(
  key: string,
  input: { defaultValue?: boolean; description?: string },
  actorId: string,
  auditOrgId: string,
) {
  const existing = await prisma.featureFlag.findUnique({ where: { key } });
  if (!existing) throw new AdminNotFoundError("Feature flag not found");

  const updated = await prisma.featureFlag.update({
    where: { key },
    data: {
      ...(input.defaultValue !== undefined ? { defaultValue: input.defaultValue } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
    },
  });

  await writeAdminAuditLog({
    organizationId: auditOrgId,
    actorId,
    action: "admin.feature_flag.updated",
    resourceType: "feature_flag",
    resourceId: key,
    metadata: input as Record<string, unknown>,
  });

  return updated;
}

export async function setOrgFeatureOverride(
  flagKey: string,
  organizationId: string,
  value: boolean,
  actorId: string,
) {
  const flag = await prisma.featureFlag.findUnique({ where: { key: flagKey } });
  if (!flag) throw new AdminNotFoundError("Feature flag not found");

  await prisma.orgFeatureOverride.upsert({
    where: {
      organizationId_flagKey: { organizationId, flagKey },
    },
    create: { organizationId, flagKey, value },
    update: { value },
  });

  await writeAdminAuditLog({
    organizationId,
    actorId,
    action: "admin.feature_flag.override_set",
    resourceType: "org_feature_override",
    metadata: { flagKey, value },
  });

  return { flagKey, organizationId, value };
}

export async function removeOrgFeatureOverride(
  flagKey: string,
  organizationId: string,
  actorId: string,
) {
  await prisma.orgFeatureOverride.deleteMany({
    where: { organizationId, flagKey },
  });

  await writeAdminAuditLog({
    organizationId,
    actorId,
    action: "admin.feature_flag.override_removed",
    resourceType: "org_feature_override",
    metadata: { flagKey },
  });

  return { removed: true };
}
