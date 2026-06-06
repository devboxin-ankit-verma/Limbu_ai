import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/session";
import { AgentsPageClient } from "./agents-client";

export const dynamic = "force-dynamic";

export default async function AgentsPage() {
  const session = await requireAuth();

  if (!session.user.workspaceId || !session.user.organizationId) {
    redirect("/dashboard?error=no-workspace");
  }

  return <AgentsPageClient />;
}
