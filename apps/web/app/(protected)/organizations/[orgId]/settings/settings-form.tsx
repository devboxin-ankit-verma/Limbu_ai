"use client";

import { useActionState } from "react";
import { FormField } from "@limbu/ui/auth/form-field";
import { SubmitButton } from "@limbu/ui/auth/submit-button";
import {
  deleteOrganizationFormAction,
  transferOwnershipFormAction,
  updateOrganizationAction,
  uploadOrganizationLogoAction,
  type OrgActionResult,
} from "@/lib/actions/organizations";

export function SettingsForm({
  orgId,
  name,
  slug,
  eligibleOwners,
  canDelete = false,
  canTransfer = false,
}: {
  orgId: string;
  name: string;
  slug: string;
  eligibleOwners: { id: string; label: string }[];
  canDelete?: boolean;
  canTransfer?: boolean;
}) {
  const updateAction = updateOrganizationAction.bind(null, orgId);
  const [updateState, submitUpdate] = useActionState<OrgActionResult, FormData>(updateAction, {});

  const uploadAction = uploadOrganizationLogoAction.bind(null, orgId);
  const [uploadState, submitUpload] = useActionState<OrgActionResult, FormData>(uploadAction, {});

  const transferAction = transferOwnershipFormAction.bind(null, orgId);
  const [transferState, submitTransfer] = useActionState<OrgActionResult, FormData>(
    transferAction,
    {},
  );

  const deleteAction = deleteOrganizationFormAction.bind(null, orgId);
  const [deleteState, submitDelete] = useActionState<OrgActionResult, FormData>(deleteAction, {});

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <section style={cardStyle}>
        <h2 style={headingStyle}>General settings</h2>
        {updateState.error && <ErrorMsg msg={updateState.error} />}
        {updateState.success && <SuccessMsg msg="Settings saved." />}
        <form action={submitUpdate}>
          <FormField label="Organization name" name="name" defaultValue={name} required />
          <FormField label="URL slug" name="slug" defaultValue={slug} />
          <SubmitButton>Save changes</SubmitButton>
        </form>
      </section>

      <section style={cardStyle}>
        <h2 style={headingStyle}>Logo</h2>
        {uploadState.error && <ErrorMsg msg={uploadState.error} />}
        {uploadState.success && <SuccessMsg msg="Logo uploaded." />}
        <form action={submitUpload}>
          <input
            type="file"
            name="logo"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            required
            style={{ marginBottom: "1rem", width: "100%" }}
          />
          <SubmitButton variant="secondary">Upload logo</SubmitButton>
        </form>
      </section>

      {canTransfer && eligibleOwners.length > 0 && (
        <section style={cardStyle}>
          <h2 style={headingStyle}>Transfer ownership</h2>
          <p style={hintStyle}>
            Transfer ownership to another member. You will become an admin.
          </p>
          {transferState.error && <ErrorMsg msg={transferState.error} />}
          {transferState.success && <SuccessMsg msg="Ownership transferred." />}
          <form action={submitTransfer} style={{ display: "flex", gap: "0.5rem", alignItems: "end" }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="memberId" style={{ display: "block", fontSize: "0.875rem", marginBottom: 4 }}>
                New owner
              </label>
              <select
                id="memberId"
                name="memberId"
                required
                style={inputStyle}
              >
                {eligibleOwners.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" style={secondaryBtnStyle}>
              Transfer
            </button>
          </form>
        </section>
      )}

      {canDelete && (
        <section style={cardStyle}>
          <h2 style={{ ...headingStyle, color: "var(--danger)" }}>Danger zone</h2>
          <p style={hintStyle}>
            Soft-deletes the organization. This action cannot be easily undone.
          </p>
          {deleteState.error && <ErrorMsg msg={deleteState.error} />}
          <form action={submitDelete}>
            <button type="submit" style={dangerBtnStyle}>
              Delete organization
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
const hintStyle: React.CSSProperties = { color: "var(--muted)", fontSize: "0.875rem", marginBottom: "1rem" };
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem",
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "var(--bg)",
  color: "var(--text)",
};
const secondaryBtnStyle: React.CSSProperties = {
  padding: "0.75rem 1rem",
  border: "1px solid var(--border)",
  borderRadius: 8,
  background: "transparent",
  color: "var(--text)",
  cursor: "pointer",
};
const dangerBtnStyle: React.CSSProperties = {
  padding: "0.75rem 1rem",
  background: "var(--danger)",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
};

function ErrorMsg({ msg }: { msg: string }) {
  return <p style={{ color: "var(--danger)", marginBottom: "1rem", fontSize: "0.875rem" }}>{msg}</p>;
}

function SuccessMsg({ msg }: { msg: string }) {
  return <p style={{ color: "var(--success)", marginBottom: "1rem", fontSize: "0.875rem" }}>{msg}</p>;
}
