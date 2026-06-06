import { OrgRole } from "@limbu/db";
import { getOrganizationProfile, listOrganizationMembers } from "@limbu/org";
import { notFound } from "next/navigation";
import { OrgShell } from "@limbu/ui/layout/org/org-shell";
import { canFromContext, requireOrgPermission } from "@/lib/rbac/guards";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

export default async function OrganizationSettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgId: string }>;
  searchParams: Promise<{ joined?: string }>;
}) {
  const { orgId } = await params;
  const { joined } = await searchParams;
  const authCtx = await requireOrgPermission(orgId, "org:manage");

  const org = await getOrganizationProfile(orgId, authCtx.userId).catch(() => null);
  if (!org) notFound();

  const { active: members } = await listOrganizationMembers(orgId, authCtx.userId);

  const eligibleOwners = members
    .filter((m) => m.role !== OrgRole.owner && m.userId !== authCtx.userId)
    .map((m) => ({
      id: m.id,
      label: m.user.name ?? m.user.email,
    }));

  return (
    <OrgShell orgId={orgId} active="settings">
      {joined && (
        <p style={{ color: "var(--success)", marginBottom: "1rem" }}>
          Welcome to {org.name}! You&apos;ve successfully joined.
        </p>
      )}
      <SettingsForm
        orgId={orgId}
        name={org.name}
        slug={org.slug}
        eligibleOwners={eligibleOwners}
        canDelete={canFromContext(authCtx, "org:delete")}
        canTransfer={canFromContext(authCtx, "org:transfer_ownership")}
      />
    </OrgShell>
  );
}
