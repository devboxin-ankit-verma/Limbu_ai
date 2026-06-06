"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AuthCard } from "@limbu/ui/auth/auth-card";
import { FormField } from "@limbu/ui/auth/form-field";
import { OAuthButtons } from "@limbu/ui/auth/oauth-buttons";
import { SubmitButton } from "@limbu/ui/auth/submit-button";
import { registerAction, type ActionResult } from "@/lib/actions/auth";
import { signInWithGitHub, signInWithGoogle } from "@/lib/actions/oauth";

export default function RegisterPage() {
  const [state, formAction] = useActionState<ActionResult, FormData>(registerAction, {});

  return (
    <AuthCard
      title="Create account"
      subtitle="Start automating your marketing"
      footer={
        <>
          Already have an account? <Link href="/login">Sign in</Link>
        </>
      }
    >
      {state.error && (
        <p style={{ color: "var(--danger)", marginBottom: "1rem", fontSize: "0.875rem" }}>
          {state.error}
        </p>
      )}

      <OAuthButtons signInWithGoogle={signInWithGoogle} signInWithGitHub={signInWithGitHub} />

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
        <FormField label="Name" name="name" autoComplete="name" />
        <FormField
          label="Email"
          name="email"
          type="email"
          required
          autoComplete="email"
          error={state.fieldErrors?.email?.[0]}
        />
        <FormField
          label="Password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          error={state.fieldErrors?.password?.[0]}
        />
        <p style={{ color: "var(--muted)", fontSize: "0.75rem", marginBottom: "1rem" }}>
          Minimum 12 characters with uppercase, lowercase, and a number.
        </p>
        <SubmitButton>Create account</SubmitButton>
      </form>
    </AuthCard>
  );
}
