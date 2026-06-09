import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/session";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await requireAuth();
  const params = await searchParams;
  const user = session.user;

  if (!user.organizationId && !user.isSuperAdmin) {
    redirect("/organizations/new");
  }

  return (
    <div>
      {params.error === "forbidden" && (
        <p style={{ color: "var(--danger)", marginBottom: "1rem" }}>
          You don&apos;t have permission to access that resource.
        </p>
      )}
      <DashboardClient userName={user.name ?? user.email ?? "there"} />
    </div>
  );
}
