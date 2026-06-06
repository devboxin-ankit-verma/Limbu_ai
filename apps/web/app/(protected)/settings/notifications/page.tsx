import { NotificationPreferencesClient } from "@limbu/ui/notifications/notification-preferences-client";

export const dynamic = "force-dynamic";

export default function NotificationPreferencesPage() {
  return (
    <main style={{ padding: "2rem", maxWidth: 720, margin: "0 auto" }}>
      <NotificationPreferencesClient />
    </main>
  );
}
