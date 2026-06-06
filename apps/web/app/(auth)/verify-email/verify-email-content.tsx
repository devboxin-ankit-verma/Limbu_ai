import Link from "next/link";
import { AuthCard } from "@limbu/ui/auth/auth-card";
import { ResendVerificationForm } from "./resend-form";
import { verifyEmailAction } from "@/lib/actions/auth";

export async function VerifyEmailContent({
  token,
  registered,
}: {
  token?: string;
  registered?: string;
}) {
  if (token) {
    const result = await verifyEmailAction(token);

    if (result.success) {
      return (
        <AuthCard title="Email verified" subtitle="Your account is ready">
          <p style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            Your email has been verified successfully.
          </p>
          <Link
            href="/login"
            style={{
              display: "block",
              textAlign: "center",
              padding: "0.75rem",
              background: "var(--primary)",
              color: "white",
              borderRadius: 8,
            }}
          >
            Sign in
          </Link>
        </AuthCard>
      );
    }

    return (
      <AuthCard title="Verification failed" subtitle="This link may have expired">
        <p style={{ color: "var(--danger)", marginBottom: "1rem", fontSize: "0.875rem" }}>
          {result.error}
        </p>
        <ResendVerificationForm />
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Verify your email"
      subtitle={
        registered
          ? "We sent a verification link to your inbox"
          : "Check your inbox for the verification link"
      }
    >
      <p style={{ color: "var(--muted)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
        Didn&apos;t receive the email? Enter your address to resend.
      </p>
      <ResendVerificationForm />
      <p style={{ textAlign: "center", marginTop: "1.5rem" }}>
        <Link href="/login">Back to sign in</Link>
      </p>
    </AuthCard>
  );
}
