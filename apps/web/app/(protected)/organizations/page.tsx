import Link from "next/link";
import { listUserOrganizations } from "@limbu/org";
import { requireAuth } from "@/lib/session";
import { switchOrganizationSimple } from "@/lib/actions/organizations";

export const dynamic = "force-dynamic";

export default async function OrganizationsPage() {
  const session = await requireAuth();
  const organizations = await listUserOrganizations(session.user.id);

  return (
    <main style={{ padding: "2rem", maxWidth: 800, margin: "0 auto" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1>Organizations</h1>
          <p style={{ color: "var(--muted)" }}>Manage your teams and workspaces</p>
        </div>
        <Link
          href="/organizations/new"
          style={{
            padding: "0.75rem 1.25rem",
            background: "var(--primary)",
            color: "white",
            borderRadius: 8,
          }}
        >
          Create organization
        </Link>
      </header>

      {organizations.length === 0 ? (
        <section
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <p style={{ marginBottom: "1rem" }}>You don&apos;t belong to any organization yet.</p>
          <Link href="/organizations/new">Create your first organization</Link>
        </section>
      ) : (
        <ul style={{ display: "grid", gap: "1rem", listStyle: "none" }}>
          {organizations.map((org) => (
            <li
              key={org.id}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "1.25rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <div>
                  <Link
                    href={`/organizations/${org.id}/settings`}
                    style={{ fontWeight: 600, color: "var(--text)" }}
                  >
                    {org.name}
                  </Link>
                  <p style={{ color: "var(--muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                    {org.slug} · {org.membershipRole} · {org._count.members} members
                  </p>
                  {session.user.organizationId === org.id && (
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--success)",
                        marginTop: "0.25rem",
                        display: "inline-block",
                      }}
                    >
                      Active organization
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {session.user.organizationId !== org.id && (
                    <form action={switchOrganizationSimple.bind(null, org.id)}>
                      <button
                        type="submit"
                        style={{
                          padding: "0.5rem 1rem",
                          border: "1px solid var(--border)",
                          borderRadius: 8,
                          background: "transparent",
                          color: "var(--text)",
                          cursor: "pointer",
                        }}
                      >
                        Switch
                      </button>
                    </form>
                  )}
                  <Link
                    href={`/organizations/${org.id}/settings`}
                    style={{
                      padding: "0.5rem 1rem",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                    }}
                  >
                    Manage
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p style={{ marginTop: "2rem" }}>
        <Link href="/dashboard">← Back to dashboard</Link>
      </p>
    </main>
  );
}
