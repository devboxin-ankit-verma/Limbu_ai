export const NOTIFICATION_CONFIG = {
  workerSecret: process.env.NOTIFICATION_WORKER_SECRET ?? "",
  workerBatchSize: Number(process.env.NOTIFICATION_WORKER_BATCH_SIZE ?? 25),
  emailFrom: process.env.EMAIL_FROM ?? "Limbu <noreply@limbu.ai>",
  vapidPublicKey: process.env.VAPID_PUBLIC_KEY ?? "",
  vapidPrivateKey: process.env.VAPID_PRIVATE_KEY ?? "",
  vapidSubject: process.env.VAPID_SUBJECT ?? "mailto:support@limbu.ai",
  mockEmail: process.env.NOTIFICATION_MOCK_EMAIL === "true",
  mockPush: process.env.NOTIFICATION_MOCK_PUSH === "true",
};
