import { getOrganizationProfile } from "@limbu/org";
import { notFound } from "next/navigation";
import { requireAuth } from "@limbu/shared/session";
import { OrgNav } from "./org-nav";

export async function OrgShell({
  orgId,
  active,
  children,
}: {
  orgId: string;
  active: "profile" | "settings" | "members";
  children: React.ReactNode;
}) {
  const session = await requireAuth();
  const org = await getOrganizationProfile(orgId, session.user.id).catch(() => null);

  if (!org) notFound();

  return (
    <main style={{ padding: "2rem", maxWidth: 960, margin: "0 auto" }}>
      <header style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.75rem" }}>{org.name}</h1>
        <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
          {org.slug} · {org.planTier} plan
        </p>
      </header>
      <OrgNav orgId={orgId} active={active} />
      {children}
    </main>
  );
}
