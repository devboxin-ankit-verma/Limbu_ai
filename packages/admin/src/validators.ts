import { OrgStatus, PlanTier } from "@limbu/db";
import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(200).optional(),
});

export const updateUserSchema = z.object({
  isSuperAdmin: z.boolean().optional(),
  restore: z.boolean().optional(),
});

export const updateOrganizationSchema = z.object({
  status: z.nativeEnum(OrgStatus).optional(),
  planTier: z.nativeEnum(PlanTier).optional(),
  name: z.string().trim().min(1).max(120).optional(),
});

export const updateFeatureFlagSchema = z.object({
  defaultValue: z.boolean().optional(),
  description: z.string().max(500).optional(),
});

export const setOrgFeatureOverrideSchema = z.object({
  organizationId: z.string().uuid(),
  value: z.boolean(),
});

export const setSubscriptionPlanSchema = z.object({
  plan: z.nativeEnum(PlanTier),
});

export const auditLogQuerySchema = paginationSchema.extend({
  organizationId: z.string().uuid().optional(),
  action: z.string().max(128).optional(),
});
