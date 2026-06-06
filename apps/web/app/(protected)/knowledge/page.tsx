import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/session";
import { KnowledgePageClient } from "./knowledge-client";

export const dynamic = "force-dynamic";

export default async function KnowledgePage() {
  const session = await requireAuth();

  if (!session.user.workspaceId || !session.user.organizationId) {
    redirect("/dashboard?error=no-workspace");
  }

  return (
    <KnowledgePageClient
      organizationId={session.user.organizationId}
      workspaceId={session.user.workspaceId}
    />
  );
}
