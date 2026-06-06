import { sendTemplatedEmail } from "@limbu/notifications";

export async function sendInvitationEmail(input: {
  userId: string;
  to: string;
  organizationName: string;
  inviterName: string;
  token: string;
  role: string;
}) {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const inviteUrl = `${baseUrl}/invite/${encodeURIComponent(input.token)}`;

  await sendTemplatedEmail({
    userId: input.userId,
    eventType: "org.invitation",
    templateKey: "org_invitation",
    emailTo: input.to,
    variables: {
      organizationName: input.organizationName,
      inviterName: input.inviterName,
      role: input.role,
      inviteUrl,
      title: `Invitation to ${input.organizationName}`,
      body: `${input.inviterName} invited you to join ${input.organizationName}.`,
    },
  });
}
