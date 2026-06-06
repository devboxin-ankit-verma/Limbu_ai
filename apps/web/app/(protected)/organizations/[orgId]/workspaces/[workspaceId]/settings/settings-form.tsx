"use client";

import { useActionState } from "react";
import { FormField } from "@limbu/ui/auth/form-field";
import { SubmitButton } from "@limbu/ui/auth/submit-button";
import {
  deleteWorkspaceFormAction,
  setDefaultWorkspaceFormAction,
  updateWorkspaceAction,
  type WorkspaceActionResult,
} from "@/lib/actions/workspaces";

export function SettingsForm({
  orgId,
  workspaceId,
  name,
  industry,
  timezone,
  isDefault,
  canManage,
  canSetDefault = false,
}: {
  orgId: string;
  workspaceId: string;
  name: string;
  industry: string | null;
  timezone: string;
  isDefault: boolean;
  canManage: boolean;
  canSetDefault?: boolean;
}) {
  const updateAction = updateWorkspaceAction.bind(null, orgId, workspaceId);
  const [updateState, submitUpdate] = useActionState<WorkspaceActionResult, FormData>(
    updateAction,
    {},
  );

  const defaultAction = setDefaultWorkspaceFormAction.bind(null, orgId, workspaceId);
  const [defaultState, submitDefault] = useActionState<WorkspaceActionResult, FormData>(
    defaultAction,
    {},
  );

  const deleteAction = deleteWorkspaceFormAction.bind(null, orgId, workspaceId);
  const [deleteState, submitDelete] = useActionState<WorkspaceActionResult, FormData>(
    deleteAction,
    {},
  );

  if (!canManage) {
    return (
      <section style={cardStyle}>
        <h2 style={headingStyle}>Workspace details</h2>
        <dl style={{ display: "grid", gap: "0.5rem", fontSize: "0.9rem" }}>
          <div>
            <dt style={{ color: "var(--muted)" }}>Name</dt>
            <dd>{name}</dd>
          </div>
          <div>
            <dt style={{ color: "var(--muted)" }}>Industry</dt>
            <dd>{industry ?? "—"}</dd>
          </div>
          <div>
            <dt style={{ color: "var(--muted)" }}>Timezone</dt>
            <dd>{timezone}</dd>
          </div>
          <div>
            <dt style={{ color: "var(--muted)" }}>Default workspace</dt>
            <dd>{isDefault ? "Yes" : "No"}</dd>
          </div>
        </dl>
      </section>
    );
  }

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <section style={cardStyle}>
        <h2 style={headingStyle}>General settings</h2>
        {updateState.error && <ErrorMsg msg={updateState.error} />}
        {updateState.success && <SuccessMsg msg="Settings saved." />}
        <form action={submitUpdate}>
          <FormField label="Workspace name" name="name" defaultValue={name} required />
          <FormField label="Industry" name="industry" defaultValue={industry ?? ""} />
          <FormField label="Timezone" name="timezone" defaultValue={timezone} />
          <SubmitButton>Save changes</SubmitButton>
        </form>
      </section>

      {!isDefault && canSetDefault && (
        <section style={cardStyle}>
          <h2 style={headingStyle}>Default workspace</h2>
          <p style={hintStyle}>
            The default workspace is selected automatically when switching to this organization.
          </p>
          {defaultState.error && <ErrorMsg msg={defaultState.error} />}
          {defaultState.success && <SuccessMsg msg="Default workspace updated." />}
          <form action={submitDefault}>
            <SubmitButton variant="secondary">Set as default</SubmitButton>
          </form>
        </section>
      )}

      {isDefault && (
        <section style={cardStyle}>
          <p style={hintStyle}>This is the default workspace for the organization.</p>
        </section>
      )}

      {!isDefault && canManage && (
        <section style={cardStyle}>
          <h2 style={headingStyle}>Delete workspace</h2>
          <p style={hintStyle}>
            Archives this workspace. This action cannot be undone from the UI.
          </p>
          {deleteState.error && <ErrorMsg msg={deleteState.error} />}
          <form action={submitDelete}>
            <button
              type="submit"
              style={{
                padding: "0.75rem 1.25rem",
                borderRadius: 8,
                border: "1px solid var(--danger)",
                background: "transparent",
                color: "var(--danger)",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Delete workspace
            </button>
          </form>
        </section>
      )}
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  padding: "1.5rem",
};
const headingStyle: React.CSSProperties = { fontSize: "1.125rem", marginBottom: "1rem" };
const hintStyle: React.CSSProperties = {
  color: "var(--muted)",
  fontSize: "0.875rem",
  marginBottom: "1rem",
};

function ErrorMsg({ msg }: { msg: string }) {
  return <p style={{ color: "var(--danger)", marginBottom: "1rem", fontSize: "0.875rem" }}>{msg}</p>;
}

function SuccessMsg({ msg }: { msg: string }) {
  return <p style={{ color: "var(--success)", marginBottom: "1rem", fontSize: "0.875rem" }}>{msg}</p>;
}
