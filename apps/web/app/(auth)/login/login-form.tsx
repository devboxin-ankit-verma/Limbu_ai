"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { AuthCard } from "@limbu/ui/auth/auth-card";
import { FormField } from "@limbu/ui/auth/form-field";
import { OAuthButtons } from "@limbu/ui/auth/oauth-buttons";
import { SubmitButton } from "@limbu/ui/auth/submit-button";
import { loginAction, type ActionResult } from "@/lib/actions/auth";
import { signInWithGitHub, signInWithGoogle } from "@/lib/actions/oauth";

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? undefined;
  const reset = searchParams.get("reset");
  const [state, formAction] = useActionState<ActionResult, FormData>(loginAction, {});

  return (
    <AuthCard
      title="Sign in"
      subtitle="Welcome back to Limbu"
      footer={
        <>
          Don&apos;t have an account? <Link href="/register">Create one</Link>
        </>
      }
    >
      {reset && (
        <p style={{ color: "var(--success)", marginBottom: "1rem", fontSize: "0.875rem" }}>
          Password reset successful. Sign in with your new password.
        </p>
      )}
      {state.error && (
        <p style={{ color: "var(--danger)", marginBottom: "1rem", fontSize: "0.875rem" }}>
          {state.error}
        </p>
      )}

      <OAuthButtons
        callbackUrl={callbackUrl}
        signInWithGoogle={signInWithGoogle}
        signInWithGitHub={signInWithGitHub}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          margin: "1.5rem 0",
          color: "var(--muted)",
          fontSize: "0.8rem",
        }}
      >
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        or
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
      </div>

      <form action={formAction}>
        {callbackUrl && <input type="hidden" name="callbackUrl" value={callbackUrl} />}
        <FormField label="Email" name="email" type="email" required autoComplete="email" />
        <FormField
          label="Password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
        <div style={{ textAlign: "right", marginBottom: "1rem" }}>
          <Link href="/forgot-password" style={{ fontSize: "0.875rem" }}>
            Forgot password?
          </Link>
        </div>
        <SubmitButton>Sign in</SubmitButton>
      </form>
    </AuthCard>
  );
}
