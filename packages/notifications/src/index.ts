export * from "./types";
export * from "./errors";
export * from "./validators";
export * from "./access";
export * from "./config";
export * from "./events/catalog";

export {
  listNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  createInAppNotification,
} from "./services/notification.service";

export {
  getUserPreferences,
  updateUserPreference,
  seedDefaultPreferences,
  getEffectivePreference,
} from "./services/preference.service";

export {
  dispatchNotification,
  enqueueNotificationJob,
  sendTemplatedEmail,
} from "./services/dispatch.service";

export { listDeliveries } from "./services/delivery.service";
export { listTemplates, renderNotificationTemplate, getTemplate } from "./services/template.service";

export {
  getVapidPublicKey,
  subscribePush,
  unsubscribePush,
  sendPushNotification,
} from "./providers/push";

export { sendEmailNotification } from "./providers/smtp";
