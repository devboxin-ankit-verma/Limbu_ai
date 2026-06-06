import Link from "next/link";
import { ResetPasswordForm } from "./reset-password-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <h1 style={{ marginBottom: "0.5rem" }}>Invalid link</h1>
        <p style={{ color: "var(--muted)", marginBottom: "1rem" }}>
          This reset link is missing or expired.
        </p>
        <Link href="/forgot-password">Request a new reset link</Link>
      </div>
    );
  }

  return <ResetPasswordForm token={token} />;
}
