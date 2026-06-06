import { requirePermission } from "@/lib/session";

export default async function SettingsPage() {
  const session = await requirePermission("org:manage");

  return (
    <main style={{ padding: "2rem", maxWidth: 800, margin: "0 auto" }}>
      <h1 style={{ marginBottom: "1rem" }}>Organization Settings</h1>
      <p style={{ color: "var(--muted)" }}>
        Protected route — requires <code>org:manage</code> permission.
      </p>
      <p style={{ marginTop: "1rem" }}>
        Signed in as {session.user.email} ({session.user.orgRole ?? "no org role"})
      </p>
    </main>
  );
}
