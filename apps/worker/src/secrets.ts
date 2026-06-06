import { verifyWorkerSecret as verifyWorkflowWorkerSecret } from "@limbu/workflows";
import { verifyWorkerSecret as verifyRagWorkerSecret } from "@limbu/rag";
import { verifyWorkerSecret as verifyNotificationWorkerSecret } from "@limbu/notifications";

export function verifyWorkflowSecret(header: string | null): boolean {
  return verifyWorkflowWorkerSecret(header);
}

export function verifyRagSecret(header: string | null): boolean {
  return verifyRagWorkerSecret(header);
}

export function verifyNotificationSecret(header: string | null): boolean {
  return verifyNotificationWorkerSecret(header);
}
