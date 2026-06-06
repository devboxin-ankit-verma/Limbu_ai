import { WorkspaceRole } from "@limbu/db";
import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  industry: z.string().max(100).optional(),
  timezone: z.string().min(1).default("UTC"),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  industry: z.string().max(100).nullable().optional(),
  timezone: z.string().min(1).optional(),
});

export const addWorkspaceMemberSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["admin", "approver", "editor", "viewer"]),
});

export const updateWorkspaceMemberRoleSchema = z.object({
  role: z.enum(["admin", "approver", "editor", "viewer"]),
});

export const INVITABLE_WS_ROLES = ["admin", "approver", "editor", "viewer"] as const;
export type InvitableWorkspaceRole = (typeof INVITABLE_WS_ROLES)[number];

export function uiRoleToWorkspaceRole(role: InvitableWorkspaceRole): WorkspaceRole {
  return role as WorkspaceRole;
}
