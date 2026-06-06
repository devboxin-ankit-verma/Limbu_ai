import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/session";
import "./chat.css";

export const dynamic = "force-dynamic";

export default async function ChatLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth();

  if (!session.user.workspaceId || !session.user.organizationId) {
    redirect("/dashboard?error=no-workspace");
  }

  return children;
}
