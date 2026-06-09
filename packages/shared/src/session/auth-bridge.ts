import type { AuthSession } from "../types/session";

type AuthFn = () => Promise<AuthSession | null>;

let authFn: AuthFn | undefined;

export function configureAuth(fn: AuthFn) {
  authFn = fn;
}

export async function getAuthSession(): Promise<AuthSession | null> {
  if (!authFn) {
    if (process.env.DEV_SKIP_AUTH === "true") {
      const { getDevMockSession } = await import("../dev-session");
      return getDevMockSession();
    }
    throw new Error(
      "[@limbu/shared] Auth not configured. Import @/lib/shared-config before using session utilities.",
    );
  }
  return authFn();
}
