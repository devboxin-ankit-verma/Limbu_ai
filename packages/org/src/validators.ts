import { OrgRole } from "@limbu/db";
import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  slug: z
    .string()
    .min(2)
    .max(48)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens")
    .optional(),
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  slug: z
    .string()
    .min(2)
    .max(48)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "member", "viewer"]),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(["admin", "member", "viewer"]),
});

export const transferOwnershipSchema = z.object({
  newOwnerMemberId: z.string().uuid(),
});

/** Map UI role labels to Prisma OrgRole */
export function uiRoleToOrgRole(role: "admin" | "member" | "viewer"): OrgRole {
  if (role === "admin") return OrgRole.admin;
  if (role === "viewer") return OrgRole.viewer;
  return OrgRole.member;
}

export const INVITABLE_ORG_ROLES = ["admin", "member", "viewer"] as const;
export type InvitableOrgRole = (typeof INVITABLE_ORG_ROLES)[number];
