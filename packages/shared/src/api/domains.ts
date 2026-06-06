import { isAdminError, resolveAuditOrgId } from "@limbu/admin";
import { isAnalyticsError } from "@limbu/analytics";
import type { Permission } from "@limbu/auth/rbac";
import { isBillingError } from "@limbu/billing";
import { isChatError } from "@limbu/chat";
import { isNotificationError } from "@limbu/notifications";
import { isOrgError } from "@limbu/org";
import { isAgentError } from "@limbu/agents";
import { isRagError } from "@limbu/rag";
import { isWorkflowError } from "@limbu/workflows";
import {
  createDomainErrorResponse,
  forbiddenResponse,
  missingWorkspaceResponse,
  unauthorizedResponse,
} from "./error-mapper";
import { getAuthSession } from "../session/auth-bridge";

export { missingWorkspaceResponse, unauthorizedResponse, forbiddenResponse };

export const workflowErrorResponse = createDomainErrorResponse(isWorkflowError);
export const agentErrorResponse = createDomainErrorResponse(isAgentError);
export const ragErrorResponse = createDomainErrorResponse(isRagError);
export const chatErrorResponse = createDomainErrorResponse(isChatError, true);
export const billingErrorResponse = createDomainErrorResponse(isBillingError);
export const analyticsErrorResponse = createDomainErrorResponse(isAnalyticsError);
export const orgErrorResponse = createDomainErrorResponse(isOrgError, true);
export const notificationErrorResponse = createDomainErrorResponse(isNotificationError);
export const adminErrorResponse = createDomainErrorResponse(isAdminError);

export const workspaceErrorResponse = orgErrorResponse;

export function chatMissingWorkspaceResponse() {
  return missingWorkspaceResponse("Select a workspace before using chat", "NO_WORKSPACE");
}

export async function requireNotificationApi() {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return { error: unauthorizedResponse() };
  }
  return { session, userId: session.user.id };
}

export async function requireAdminApi(permission: Permission = "platform:access") {
  const { requirePlatformAdmin } = await import("@limbu/admin");
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return { error: unauthorizedResponse() };
  }
  try {
    requirePlatformAdmin(!!session.user.isSuperAdmin, permission);
  } catch {
    return { error: forbiddenResponse() };
  }

  const auditOrgId = await resolveAuditOrgId(
    session.user.id,
    session.user.organizationId ?? null,
  );

  return {
    session,
    userId: session.user.id,
    auditOrgId,
  };
}
