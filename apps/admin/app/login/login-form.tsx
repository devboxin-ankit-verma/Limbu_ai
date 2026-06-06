"use client";

import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { AuthCard } from "@limbu/ui/auth/auth-card";
import { FormField } from "@limbu/ui/auth/form-field";
import { SubmitButton } from "@limbu/ui/auth/submit-button";
import { loginAction, type ActionResult } from "@/lib/actions/auth";

export function AdminLoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [state, formAction] = useActionState<ActionResult, FormData>(loginAction, {});

  return (
    <AuthCard
      title="Platform Admin"
      subtitle="Sign in with a super-admin account"
      footer={
        <span style={{ color: "var(--muted)", fontSize: "0.875rem" }}>Limbu administration console</span>
      }
    >
      {error === "forbidden" && (
        <p style={{ color: "var(--danger)", marginBottom: "1rem", fontSize: "0.875rem" }}>
          You do not have platform admin access.
        </p>
      )}
      {state.error && (
        <p style={{ color: "var(--danger)", marginBottom: "1rem", fontSize: "0.875rem" }}>
          {state.error}
        </p>
      )}
      <form action={formAction}>
        <FormField label="Email" name="email" type="email" required autoComplete="email" />
        <FormField
          label="Password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
        <SubmitButton>Sign in</SubmitButton>
      </form>
    </AuthCard>
  );
}
