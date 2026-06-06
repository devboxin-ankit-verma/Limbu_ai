"use client";

import { useActionState } from "react";
import { SubmitButton } from "@limbu/ui/auth/submit-button";
import type { WorkspaceActionResult } from "@/lib/actions/workspaces";
import {
  reactivateWorkspaceMemberFormAction,
  removeWorkspaceMemberFormAction,
  suspendWorkspaceMemberFormAction,
} from "@/lib/actions/workspace-member-forms";
import {
  addWorkspaceMemberAction,
  updateWorkspaceMemberRoleAction,
} from "@/lib/actions/workspace-members";

type Member = {
  id: string;
  role: string;
  user: { id: string; name: string | null; email: string };
};

type Eligible = {
  userId: string;
  label: string;
  orgRole: string;
};

export function MembersClient({
  orgId,
  workspaceId,
  activeMembers,
  suspendedMembers,
  eligible,
  canManage,
  currentUserId,
}: {
  orgId: string;
  workspaceId: string;
  activeMembers: Member[];
  suspendedMembers: Member[];
  eligible: Eligible[];
  canManage: boolean;
  currentUserId: string;
}) {
  const addAction = addWorkspaceMemberAction.bind(null, orgId, workspaceId);
  const [addState, submitAdd] = useActionState<WorkspaceActionResult, FormData>(addAction, {});

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      {canManage && eligible.length > 0 && (
        <section style={cardStyle}>
          <h2 style={headingStyle}>Add member</h2>
          <p style={hintStyle}>Add an existing organization member to this workspace.</p>
          {addState.error && <Msg color="var(--danger)" text={addState.error} />}
          {addState.success && <Msg color="var(--success)" text="Member added." />}
          <form action={submitAdd}>
            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="userId" style={{ display: "block", fontSize: "0.875rem", marginBottom: 4 }}>
                Organization member
              </label>
              <select id="userId" name="userId" required style={selectStyle}>
                <option value="">Select member…</option>
                {eligible.map((e) => (
                  <option key={e.userId} value={e.userId}>
                    {e.label} ({e.orgRole})
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="role" style={{ display: "block", fontSize: "0.875rem", marginBottom: 4 }}>
                Workspace role
              </label>
              <select id="role" name="role" defaultValue="editor" style={selectStyle}>
                <option value="admin">Admin</option>
                <option value="approver">Approver</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <SubmitButton>Add member</SubmitButton>
          </form>
        </section>
      )}

      <MemberList
        title="Active members"
        members={activeMembers}
        orgId={orgId}
        workspaceId={workspaceId}
        canManage={canManage}
        currentUserId={currentUserId}
      />

      {suspendedMembers.length > 0 && (
        <MemberList
          title="Suspended members"
          members={suspendedMembers}
          orgId={orgId}
          workspaceId={workspaceId}
          canManage={canManage}
          currentUserId={currentUserId}
          suspended
        />
      )}
    </div>
  );
}

function MemberList({
  title,
  members,
  orgId,
  workspaceId,
  canManage,
  currentUserId,
  suspended,
}: {
  title: string;
  members: Member[];
  orgId: string;
  workspaceId: string;
  canManage: boolean;
  currentUserId: string;
  suspended?: boolean;
}) {
  return (
    <section style={cardStyle}>
      <h2 style={headingStyle}>{title}</h2>
      <ul style={{ listStyle: "none", display: "grid", gap: "0.75rem" }}>
        {members.map((m) => (
          <li
            key={m.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1rem",
              padding: "0.75rem",
              border: "1px solid var(--border)",
              borderRadius: 8,
            }}
          >
            <div>
              <div style={{ fontWeight: 500 }}>{m.user.name ?? m.user.email}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                {m.user.email} · {m.role}
              </div>
            </div>
            {canManage && m.user.id !== currentUserId && (
              <MemberActions
                orgId={orgId}
                workspaceId={workspaceId}
                memberId={m.id}
                currentRole={m.role}
                suspended={suspended}
              />
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function MemberActions({
  orgId,
  workspaceId,
  memberId,
  currentRole,
  suspended,
}: {
  orgId: string;
  workspaceId: string;
  memberId: string;
  currentRole: string;
  suspended?: boolean;
}) {
  if (suspended) {
    return (
      <ActionButton
        label="Reactivate"
        action={reactivateWorkspaceMemberFormAction.bind(null, orgId, workspaceId, memberId)}
      />
    );
  }

  return (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
      <select
        defaultValue={currentRole}
        onChange={(e) => {
          const role = e.target.value as "admin" | "approver" | "editor" | "viewer";
          void updateWorkspaceMemberRoleAction(orgId, workspaceId, memberId, role);
        }}
        style={{ ...selectStyle, width: "auto" }}
      >
        <option value="admin">Admin</option>
        <option value="approver">Approver</option>
        <option value="editor">Editor</option>
        <option value="viewer">Viewer</option>
      </select>
      <ActionButton
        label="Suspend"
        action={suspendWorkspaceMemberFormAction.bind(null, orgId, workspaceId, memberId)}
      />
      <ActionButton
        label="Remove"
        action={removeWorkspaceMemberFormAction.bind(null, orgId, workspaceId, memberId)}
        danger
      />
    </div>
  );
}

function ActionButton({
  label,
  action,
  danger,
}: {
  label: string;
  action: () => Promise<void>;
  danger?: boolean;
}) {
  return (
    <form action={action}>
      <button
        type="submit"
        style={{
          padding: "0.4rem 0.75rem",
          fontSize: "0.8rem",
          border: `1px solid ${danger ? "var(--danger)" : "var(--border)"}`,
          borderRadius: 6,
          background: "transparent",
          color: danger ? "var(--danger)" : "var(--text)",
          cursor: "pointer",
        }}
      >
        {label}
      </button>
    </form>
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
const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem",
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "var(--bg)",
  color: "var(--text)",
};

function Msg({ color, text }: { color: string; text: string }) {
  return <p style={{ color, marginBottom: "1rem", fontSize: "0.875rem" }}>{text}</p>;
}
