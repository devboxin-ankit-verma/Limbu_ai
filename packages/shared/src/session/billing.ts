import { BillingForbiddenError } from "@limbu/billing";
import { getAuthSession } from "./auth-bridge";

export async function requireBillingSession(organizationId: string, manage = false) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return { error: "Unauthorized" as const, status: 401 as const };
  }

  if (session.user.organizationId !== organizationId && !session.user.isSuperAdmin) {
    return { error: "Forbidden", status: 403 as const };
  }

  try {
    const { requireBillingAccess, requireBillingReadAccess } = await import("@limbu/billing");
    if (manage) {
      await requireBillingAccess(organizationId, session.user.id, session.user.isSuperAdmin);
    } else {
      await requireBillingReadAccess(organizationId, session.user.id, session.user.isSuperAdmin);
    }
  } catch (err) {
    if (err instanceof BillingForbiddenError) {
      return { error: err.message, status: 403 as const };
    }
    throw err;
  }

  return {
    session,
    userId: session.user.id,
    email: session.user.email,
    isSuperAdmin: session.user.isSuperAdmin,
  };
}
