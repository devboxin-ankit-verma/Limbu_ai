import { AnalyticsForbiddenError } from "@limbu/analytics";
import { getAuthSession } from "./auth-bridge";

export async function requireAnalyticsSession(organizationId: string) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return { error: "Unauthorized" as const, status: 401 as const };
  }

  if (session.user.organizationId !== organizationId && !session.user.isSuperAdmin) {
    return { error: "Forbidden", status: 403 as const };
  }

  try {
    const { requireAnalyticsAccess } = await import("@limbu/analytics");
    await requireAnalyticsAccess(organizationId, session.user.id, session.user.isSuperAdmin);
  } catch (err) {
    if (err instanceof AnalyticsForbiddenError) {
      return { error: err.message, status: 403 as const };
    }
    throw err;
  }

  return {
    userId: session.user.id,
    isSuperAdmin: session.user.isSuperAdmin,
    orgRole: session.user.orgRole,
  };
}
