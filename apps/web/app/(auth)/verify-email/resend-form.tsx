"use client";

import { useActionState } from "react";
import { FormField } from "@limbu/ui/auth/form-field";
import { SubmitButton } from "@limbu/ui/auth/submit-button";
import { resendVerificationAction, type ActionResult } from "@/lib/actions/auth";

export function ResendVerificationForm() {
  const [state, formAction] = useActionState<ActionResult, FormData>(
    resendVerificationAction,
    {},
  );

  return (
    <>
      {state.success && (
        <p style={{ color: "var(--success)", marginBottom: "1rem", fontSize: "0.875rem" }}>
          Verification email sent.
        </p>
      )}
      {state.error && (
        <p style={{ color: "var(--danger)", marginBottom: "1rem", fontSize: "0.875rem" }}>
          {state.error}
        </p>
      )}
      <form action={formAction}>
        <FormField label="Email" name="email" type="email" required autoComplete="email" />
        <SubmitButton variant="secondary">Resend verification email</SubmitButton>
      </form>
    </>
  );
}
