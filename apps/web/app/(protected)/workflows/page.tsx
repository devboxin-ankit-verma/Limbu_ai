import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/session";
import { WorkflowsDashboardClient } from "./workflows-dashboard";

export const dynamic = "force-dynamic";

export default async function WorkflowsPage() {
  const session = await requireAuth();
  if (!session.user.workspaceId || !session.user.organizationId) {
    redirect("/dashboard?error=no-workspace");
  }
  return <WorkflowsDashboardClient />;
}
