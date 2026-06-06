"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AuthCard } from "@limbu/ui/auth/auth-card";
import { FormField } from "@limbu/ui/auth/form-field";
import { SubmitButton } from "@limbu/ui/auth/submit-button";
import { forgotPasswordAction, type ActionResult } from "@/lib/actions/auth";

export default function ForgotPasswordPage() {
  const [state, formAction] = useActionState<ActionResult, FormData>(forgotPasswordAction, {});

  return (
    <AuthCard
      title="Forgot password"
      subtitle="We'll send you a reset link"
      footer={
        <Link href="/login">Back to sign in</Link>
      }
    >
      {state.success && (
        <p style={{ color: "var(--success)", marginBottom: "1rem", fontSize: "0.875rem" }}>
          If an account exists for that email, a reset link has been sent.
        </p>
      )}
      {state.error && (
        <p style={{ color: "var(--danger)", marginBottom: "1rem", fontSize: "0.875rem" }}>
          {state.error}
        </p>
      )}

      <form action={formAction}>
        <FormField label="Email" name="email" type="email" required autoComplete="email" />
        <SubmitButton>Send reset link</SubmitButton>
      </form>
    </AuthCard>
  );
}
