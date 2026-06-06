import { getOrganizationProfile } from "@limbu/org";
import { notFound } from "next/navigation";
import { OrgShell } from "@limbu/ui/layout/org/org-shell";
import { findOrganizationLogoUrl } from "@/lib/org/logo";
import { requireAuth } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function OrganizationProfilePage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const session = await requireAuth();

  const org = await getOrganizationProfile(orgId, session.user.id).catch(() => null);
  if (!org) notFound();

  const logoUrl = await findOrganizationLogoUrl(orgId);

  return (
    <OrgShell orgId={orgId} active="profile">
      <section
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "1.5rem",
        }}
      >
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", marginBottom: "1.5rem" }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 12,
              background: "var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={`${org.name} logo`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: "2rem", color: "var(--muted)" }}>
                {org.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h2 style={{ fontSize: "1.25rem" }}>{org.name}</h2>
            <p style={{ color: "var(--muted)" }}>{org.slug}</p>
          </div>
        </div>

        <dl style={{ display: "grid", gap: "0.75rem", fontSize: "0.9rem" }}>
          <Row label="Plan" value={org.planTier} />
          <Row label="Status" value={org.status} />
          <Row label="Members" value={String(org._count.members)} />
          <Row label="Workspaces" value={String(org._count.workspaces)} />
          <Row label="Owner" value={org.owner.name ?? org.owner.email} />
          <Row label="Created" value={org.createdAt.toLocaleDateString()} />
        </dl>
      </section>
    </OrgShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt style={{ color: "var(--muted)", fontSize: "0.8rem" }}>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
