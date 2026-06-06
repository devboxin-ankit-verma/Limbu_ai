import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/session";
import { WorkflowBuilderClient } from "./workflow-builder";

export const dynamic = "force-dynamic";

export default async function WorkflowBuilderPage({
  params,
}: {
  params: Promise<{ workflowId: string }>;
}) {
  const session = await requireAuth();
  if (!session.user.workspaceId) redirect("/dashboard?error=no-workspace");
  const { workflowId } = await params;
  return <WorkflowBuilderClient workflowId={workflowId} />;
}
