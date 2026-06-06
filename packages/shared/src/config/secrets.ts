import { env } from "./env";

export function verifySecret(headerValue: string | null, secretEnvKey: string): boolean {
  const secret = env(secretEnvKey, "");
  if (!secret) return true;
  return headerValue === secret;
}

export function verifyWorkerSecret(headerValue: string | null, secretEnvKey: string): boolean {
  return verifySecret(headerValue, secretEnvKey);
}
