import type { AuthSession, WorkspaceSessionContext, WorkspaceSessionResult } from "../types/session";
import { getAuthSession } from "./auth-bridge";

export function extractWorkspaceContext(
  user: AuthSession["user"] | undefined | null,
): Exclude<WorkspaceSessionResult, { error: null }> | { error: null; context: WorkspaceSessionContext } {
  if (!user?.id) {
    return { error: "Unauthorized" as const, session: null };
  }

  const workspaceId = user.workspaceId;
  const organizationId = user.organizationId;

  if (!workspaceId || !organizationId) {
    return { error: "NO_WORKSPACE" as const, session: null };
  }

  return {
    error: null as null,
    context: {
      userId: user.id,
      workspaceId,
      organizationId,
      isSuperAdmin: user.isSuperAdmin,
    },
  };
}

export async function requireWorkspaceSession(): Promise<WorkspaceSessionResult> {
  const session = await getAuthSession();
  const result = extractWorkspaceContext(session?.user);
  if (result.error) {
    return result;
  }
  return {
    error: null,
    session: session as AuthSession,
    context: result.context,
  };
}

export async function requireWorkflowSession() {
  return requireWorkspaceSession();
}

export async function requireAgentSession() {
  return requireWorkspaceSession();
}

export async function requireRagSession() {
  return requireWorkspaceSession();
}

export async function requireChatSession() {
  return requireWorkspaceSession();
}
