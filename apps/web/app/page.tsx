import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <main style={{ padding: "4rem 2rem", maxWidth: 640, margin: "0 auto" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>Limbu</h1>
      <p style={{ color: "var(--muted)", marginBottom: "2rem" }}>
        AI-powered marketing automation for Google Business Profile, social, and reviews.
      </p>
      <div style={{ display: "flex", gap: "1rem" }}>
        <Link
          href="/login"
          style={{
            padding: "0.75rem 1.5rem",
            background: "var(--primary)",
            color: "white",
            borderRadius: 8,
          }}
        >
          Sign in
        </Link>
        <Link
          href="/register"
          style={{
            padding: "0.75rem 1.5rem",
            border: "1px solid var(--border)",
            borderRadius: 8,
          }}
        >
          Create account
        </Link>
      </div>
    </main>
  );
}
