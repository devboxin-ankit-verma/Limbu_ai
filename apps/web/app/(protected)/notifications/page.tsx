import { NotificationCenterClient } from "@limbu/ui/notifications/notification-center-client";

export const dynamic = "force-dynamic";

export default function NotificationsPage() {
  return (
    <main style={{ padding: "2rem", maxWidth: 800, margin: "0 auto" }}>
      <NotificationCenterClient />
    </main>
  );
}
