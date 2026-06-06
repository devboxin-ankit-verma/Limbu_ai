import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/session";
import { ExecutionViewerClient } from "./execution-viewer";

export const dynamic = "force-dynamic";

export default async function ExecutionViewerPage({
  params,
}: {
  params: Promise<{ workflowId: string; runId: string }>;
}) {
  const session = await requireAuth();
  if (!session.user.workspaceId) redirect("/dashboard?error=no-workspace");
  const { workflowId, runId } = await params;
  return <ExecutionViewerClient workflowId={workflowId} runId={runId} />;
}
