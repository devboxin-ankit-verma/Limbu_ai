"use client";

import { useActionState } from "react";
import { FormField } from "@limbu/ui/auth/form-field";
import { SubmitButton } from "@limbu/ui/auth/submit-button";
import type { OrgActionResult } from "@/lib/actions/organizations";
import {
  reactivateMemberFormAction,
  removeMemberFormAction,
  revokeInvitationFormAction,
  suspendMemberFormAction,
} from "@/lib/actions/member-forms";
import { inviteMemberAction, updateMemberRoleAction } from "@/lib/actions/members";

type Member = {
  id: string;
  role: string;
  user: { id: string; name: string | null; email: string };
};

type Invitation = {
  id: string;
  email: string;
  orgRole: string;
  expiresAt: Date;
};

export function MembersClient({
  orgId,
  activeMembers,
  suspendedMembers,
  invitations,
  canManage,
  isOwner,
  currentUserId,
}: {
  orgId: string;
  activeMembers: Member[];
  suspendedMembers: Member[];
  invitations: Invitation[];
  canManage: boolean;
  isOwner: boolean;
  currentUserId: string;
}) {
  const inviteAction = inviteMemberAction.bind(null, orgId);
  const [inviteState, submitInvite] = useActionState<OrgActionResult, FormData>(inviteAction, {});

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      {canManage && (
        <section style={cardStyle}>
          <h2 style={headingStyle}>Invite member</h2>
          {inviteState.error && <Msg color="var(--danger)" text={inviteState.error} />}
          {inviteState.success && <Msg color="var(--success)" text="Invitation sent." />}
          <form action={submitInvite}>
            <FormField label="Email" name="email" type="email" required />
            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="role" style={{ display: "block", fontSize: "0.875rem", marginBottom: 4 }}>
                Role
              </label>
              <select id="role" name="role" defaultValue="member" style={selectStyle}>
                {isOwner && <option value="admin">Admin</option>}
                <option value="member">Member</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <SubmitButton>Send invitation</SubmitButton>
          </form>
        </section>
      )}

      <MemberList
        title="Active members"
        members={activeMembers}
        orgId={orgId}
        canManage={canManage}
        isOwner={isOwner}
        currentUserId={currentUserId}
      />

      {suspendedMembers.length > 0 && (
        <MemberList
          title="Suspended members"
          members={suspendedMembers}
          orgId={orgId}
          canManage={canManage}
          isOwner={isOwner}
          currentUserId={currentUserId}
          suspended
        />
      )}

      {canManage && invitations.length > 0 && (
        <section style={cardStyle}>
          <h2 style={headingStyle}>Pending invitations</h2>
          <ul style={{ listStyle: "none", display: "grid", gap: "0.75rem" }}>
            {invitations.map((inv) => (
              <li
                key={inv.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.75rem",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                }}
              >
                <div>
                  <div>{inv.email}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                    {inv.orgRole} · expires {new Date(inv.expiresAt).toLocaleDateString()}
                  </div>
                </div>
                <RevokeButton orgId={orgId} invitationId={inv.id} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function MemberList({
  title,
  members,
  orgId,
  canManage,
  isOwner,
  currentUserId,
  suspended,
}: {
  title: string;
  members: Member[];
  orgId: string;
  canManage: boolean;
  isOwner: boolean;
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
            {canManage && m.role !== "owner" && m.user.id !== currentUserId && (
              <MemberActions
                orgId={orgId}
                memberId={m.id}
                currentRole={m.role}
                isOwner={isOwner}
                targetIsAdmin={m.role === "admin"}
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
  memberId,
  currentRole,
  isOwner,
  targetIsAdmin,
  suspended,
}: {
  orgId: string;
  memberId: string;
  currentRole: string;
  isOwner: boolean;
  targetIsAdmin: boolean;
  suspended?: boolean;
}) {
  if (!isOwner && targetIsAdmin) return null;

  if (suspended) {
    return (
      <ActionButton
        label="Reactivate"
        action={reactivateMemberFormAction.bind(null, orgId, memberId)}
      />
    );
  }

  return (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
      {isOwner && (
        <select
          defaultValue={currentRole === "billing" ? "member" : currentRole}
          onChange={(e) => {
            const role = e.target.value as "admin" | "member" | "viewer";
            void updateMemberRoleAction(orgId, memberId, role);
          }}
          style={{ ...selectStyle, width: "auto" }}
        >
          <option value="admin">Admin</option>
          <option value="member">Member</option>
          <option value="viewer">Viewer</option>
        </select>
      )}
      <ActionButton label="Suspend" action={suspendMemberFormAction.bind(null, orgId, memberId)} />
      <ActionButton label="Remove" action={removeMemberFormAction.bind(null, orgId, memberId)} danger />
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

function RevokeButton({ orgId, invitationId }: { orgId: string; invitationId: string }) {
  return (
    <form action={revokeInvitationFormAction.bind(null, orgId, invitationId)}>
      <button type="submit" style={{ fontSize: "0.8rem", color: "var(--danger)", background: "none", border: "none", cursor: "pointer" }}>
        Revoke
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
