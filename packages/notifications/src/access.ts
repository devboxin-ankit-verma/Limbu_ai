import { NotificationForbiddenError } from "./errors";

export function assertSelfAccess(sessionUserId: string, targetUserId: string) {
  if (sessionUserId !== targetUserId) {
    throw new NotificationForbiddenError("Cannot access another user's notifications");
  }
}

export function verifyWorkerSecret(header: string | null): boolean {
  const secret = process.env.NOTIFICATION_WORKER_SECRET ?? "";
  if (!secret) return true;
  return header === secret;
}
