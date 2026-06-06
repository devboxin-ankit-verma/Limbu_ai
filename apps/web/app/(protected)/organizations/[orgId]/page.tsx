import { redirect } from "next/navigation";

export default async function OrganizationIndexPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  redirect(`/organizations/${orgId}/profile`);
}
