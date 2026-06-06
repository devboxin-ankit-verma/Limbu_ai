"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FormField } from "@limbu/ui/auth/form-field";
import { SubmitButton } from "@limbu/ui/auth/submit-button";
import {
  createWorkspaceAction,
  type WorkspaceActionResult,
} from "@/lib/actions/workspaces";

export function CreateWorkspaceForm({ orgId }: { orgId: string }) {
  const createAction = createWorkspaceAction.bind(null, orgId);
  const [state, formAction] = useActionState<WorkspaceActionResult, FormData>(
    createAction,
    {},
  );

  return (
    <>
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
          label="Workspace name"
          name="name"
          required
          error={state.fieldErrors?.name?.[0]}
        />
        <FormField
          label="Industry (optional)"
          name="industry"
          error={state.fieldErrors?.industry?.[0]}
        />
        <FormField
          label="Timezone"
          name="timezone"
          defaultValue="UTC"
          error={state.fieldErrors?.timezone?.[0]}
        />
        <SubmitButton>Create workspace</SubmitButton>
      </form>

      <p style={{ marginTop: "1.5rem" }}>
        <Link href={`/organizations/${orgId}/workspaces`}>Cancel</Link>
      </p>
    </>
  );
}
