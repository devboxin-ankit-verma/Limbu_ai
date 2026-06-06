"use client";

import { useActionState } from "react";
import { AuthCard } from "@limbu/ui/auth/auth-card";
import { FormField } from "@limbu/ui/auth/form-field";
import { SubmitButton } from "@limbu/ui/auth/submit-button";
import { resetPasswordAction, type ActionResult } from "@/lib/actions/auth";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction] = useActionState<ActionResult, FormData>(resetPasswordAction, {});

  return (
    <AuthCard title="Reset password" subtitle="Choose a new password">
      {state.error && (
        <p style={{ color: "var(--danger)", marginBottom: "1rem", fontSize: "0.875rem" }}>
          {state.error}
        </p>
      )}

      <form action={formAction}>
        <input type="hidden" name="token" value={token} />
        <FormField
          label="New password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
        />
        <FormField
          label="Confirm password"
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
        />
        <p style={{ color: "var(--muted)", fontSize: "0.75rem", marginBottom: "1rem" }}>
          Minimum 12 characters with uppercase, lowercase, and a number.
        </p>
        <SubmitButton>Reset password</SubmitButton>
      </form>
    </AuthCard>
  );
}
