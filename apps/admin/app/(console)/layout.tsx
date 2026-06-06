import { AdminShell } from "@limbu/ui/layout/admin/admin-shell";
import { requirePlatformAccess } from "@/lib/rbac/guards";

export const dynamic = "force-dynamic";

const WEB_APP_URL = process.env.NEXT_PUBLIC_WEB_APP_URL ?? "http://localhost:3000";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requirePlatformAccess();
  return (
    <AdminShell basePath="" backHref={WEB_APP_URL} backLabel="← Back to Limbu app">
      {children}
    </AdminShell>
  );
}
