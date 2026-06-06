import Link from "next/link";
import { getInvitationByToken } from "@limbu/org";
import { notFound } from "next/navigation";
import { acceptInvitationFormAction } from "@/lib/actions/invitations";
import { requireAuth } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AcceptInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const session = await requireAuth();
  const invitation = await getInvitationByToken(token);

  if (!invitation) notFound();

  if (invitation.email.toLowerCase() !== session.user.email?.toLowerCase()) {
    return (
      <main style={{ padding: "2rem", maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
        <h1 style={{ marginBottom: "1rem" }}>Wrong account</h1>
        <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
          This invitation was sent to <strong>{invitation.email}</strong>. You are signed in as{" "}
          <strong>{session.user.email}</strong>.
        </p>
        <Link href="/dashboard">Go to dashboard</Link>
      </main>
    );
  }

  const accept = acceptInvitationFormAction.bind(null, token);

  return (
    <main style={{ padding: "2rem", maxWidth: 480, margin: "0 auto" }}>
      <section
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <h1 style={{ marginBottom: "0.5rem" }}>Join {invitation.organization.name}</h1>
        <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
          You&apos;ve been invited as <strong>{invitation.orgRole}</strong>.
        </p>
        <form action={accept}>
          <button
            type="submit"
            style={{
              padding: "0.75rem 1.5rem",
              background: "var(--primary)",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Accept invitation
          </button>
        </form>
      </section>
    </main>
  );
}
