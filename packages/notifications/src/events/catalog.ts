import type { NotificationChannel } from "@limbu/db";

export type NotificationEventDefinition = {
  eventType: string;
  label: string;
  description: string;
  defaultTemplateKey: string;
  defaultChannels: NotificationChannel[];
  defaultEmail: boolean;
  defaultPush: boolean;
  defaultInApp: boolean;
};

export const NOTIFICATION_EVENTS: Record<string, NotificationEventDefinition> = {
  "workflow.update": {
    eventType: "workflow.update",
    label: "Workflow updates",
    description: "Notifications when workflows complete or fail",
    defaultTemplateKey: "workflow_update",
    defaultChannels: ["in_app", "email", "push", "workflow"],
    defaultEmail: true,
    defaultPush: true,
    defaultInApp: true,
  },
  "billing.alert": {
    eventType: "billing.alert",
    label: "Billing alerts",
    description: "Payment failures, low credits, and subscription changes",
    defaultTemplateKey: "billing_alert",
    defaultChannels: ["in_app", "email"],
    defaultEmail: true,
    defaultPush: false,
    defaultInApp: true,
  },
  "org.invitation": {
    eventType: "org.invitation",
    label: "Organization invitations",
    description: "When you are invited to join an organization",
    defaultTemplateKey: "org_invitation",
    defaultChannels: ["email"],
    defaultEmail: true,
    defaultPush: false,
    defaultInApp: false,
  },
  "auth.verify_email": {
    eventType: "auth.verify_email",
    label: "Email verification",
    description: "Account verification emails",
    defaultTemplateKey: "verify_email",
    defaultChannels: ["email"],
    defaultEmail: true,
    defaultPush: false,
    defaultInApp: false,
  },
  "auth.password_reset": {
    eventType: "auth.password_reset",
    label: "Password reset",
    description: "Password reset emails",
    defaultTemplateKey: "password_reset",
    defaultChannels: ["email"],
    defaultEmail: true,
    defaultPush: false,
    defaultInApp: false,
  },
  "product.alert": {
    eventType: "product.alert",
    label: "Product alerts",
    description: "General product and system notifications",
    defaultTemplateKey: "generic_alert",
    defaultChannels: ["in_app", "email", "push"],
    defaultEmail: true,
    defaultPush: true,
    defaultInApp: true,
  },
};

export const ALL_EVENT_TYPES = Object.keys(NOTIFICATION_EVENTS);

export function getEventDefinition(eventType: string): NotificationEventDefinition {
  return (
    NOTIFICATION_EVENTS[eventType] ?? {
      eventType,
      label: eventType,
      description: "Custom notification event",
      defaultTemplateKey: "generic_alert",
      defaultChannels: ["in_app", "email"],
      defaultEmail: true,
      defaultPush: false,
      defaultInApp: true,
    }
  );
}
