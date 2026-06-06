"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FormField } from "@limbu/ui/auth/form-field";
import { SubmitButton } from "@limbu/ui/auth/submit-button";
import {
  createOrganizationAction,
  type OrgActionResult,
} from "@/lib/actions/organizations";

export default function NewOrganizationPage() {
  const [state, formAction] = useActionState<OrgActionResult, FormData>(
    createOrganizationAction,
    {},
  );

  return (
    <main style={{ padding: "2rem", maxWidth: 480, margin: "0 auto" }}>
      <h1 style={{ marginBottom: "0.5rem" }}>Create organization</h1>
      <p style={{ color: "var(--muted)", marginBottom: "2rem" }}>
        Set up your team. A default workspace will be created automatically.
      </p>

      {state.error && (
        <p style={{ color: "var(--danger)", marginBottom: "1rem", fontSize: "0.875rem" }}>
          {state.error}
        </p>
      )}

      <form
        action={formAction}
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "1.5rem",
        }}
      >
        <FormField
          label="Organization name"
          name="name"
          required
          error={state.fieldErrors?.name?.[0]}
        />
        <FormField
          label="URL slug (optional)"
          name="slug"
          error={state.fieldErrors?.slug?.[0]}
        />
        <p style={{ color: "var(--muted)", fontSize: "0.75rem", marginBottom: "1rem" }}>
          Lowercase letters, numbers, and hyphens only. Auto-generated if left blank.
        </p>
        <SubmitButton>Create organization</SubmitButton>
      </form>

      <p style={{ marginTop: "1.5rem" }}>
        <Link href="/organizations">Cancel</Link>
      </p>
    </main>
  );
}
