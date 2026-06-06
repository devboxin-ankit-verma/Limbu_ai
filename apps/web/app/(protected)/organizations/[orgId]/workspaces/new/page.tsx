import { CreateWorkspaceForm } from "./create-workspace-form";
import { requireOrgPermission } from "@/lib/rbac/guards";

export const dynamic = "force-dynamic";

export default async function NewWorkspacePage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  await requireOrgPermission(orgId, "workspace:create");

  return (
    <main style={{ padding: "2rem", maxWidth: 480, margin: "0 auto" }}>
      <h1 style={{ marginBottom: "0.5rem" }}>Create workspace</h1>
      <p style={{ color: "var(--muted)", marginBottom: "2rem" }}>
        Add a new workspace to organize campaigns and content.
      </p>
      <CreateWorkspaceForm orgId={orgId} />
    </main>
  );
}
