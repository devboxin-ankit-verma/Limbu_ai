import { configureAuth } from "@limbu/shared/session";
import { getDevMockSession, isDevAuthBypassEnabled } from "@limbu/shared/dev-session";

configureAuth(async () => {
  if (isDevAuthBypassEnabled()) return getDevMockSession();
  const { auth } = await import("@/auth");
  return auth();
});
