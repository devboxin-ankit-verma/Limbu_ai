import type { NotificationChannel, NotificationDeliveryStatus } from "@limbu/db";

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

export type NotificationPayload = {
  title: string;
  body: string;
  actionUrl?: string;
  [key: string]: unknown;
};

export type NotificationRow = {
  id: string;
  type: string;
  eventType: string | null;
  payload: NotificationPayload;
  readAt: string | null;
  createdAt: string;
};

export type PreferenceRow = {
  eventType: string;
  label: string;
  description: string;
  email: boolean;
  push: boolean;
  inApp: boolean;
};

export type DeliveryRow = {
  id: string;
  channel: NotificationChannel;
  templateKey: string | null;
  status: NotificationDeliveryStatus;
  error: string | null;
  createdAt: string;
  sentAt: string | null;
};

export type TemplateRow = {
  key: string;
  name: string;
  subject: string | null;
  channels: NotificationChannel[];
  description: string | null;
};

export type DispatchInput = {
  userId: string;
  eventType: string;
  type?: string;
  templateKey?: string;
  payload: NotificationPayload;
  channels?: NotificationChannel[];
  emailTo?: string;
  skipPreferences?: boolean;
};

export type DispatchResult = {
  notificationId: string | null;
  jobIds: string[];
  deliveries: string[];
};
