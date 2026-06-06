import { NotificationBell } from "@limbu/ui/notifications/notification-bell";
import { PermissionProvider } from "@limbu/ui/rbac/permission-provider";
import { getGrantedPermissionsForSession } from "@/lib/rbac/guards";
import { requireAuth } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();
  const grants = await getGrantedPermissionsForSession();

  return (
    <PermissionProvider grants={grants}>
      <div style={{ position: "fixed", top: 12, right: 16, zIndex: 50 }}>
        <NotificationBell />
      </div>
      {children}
    </PermissionProvider>
  );
}
