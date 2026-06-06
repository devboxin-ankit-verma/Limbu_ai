import { sendTemplatedEmail } from "@limbu/notifications";

export async function sendVerificationEmail(
  to: string,
  token: string,
  userId: string,
): Promise<void> {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const verifyUrl = `${baseUrl}/verify-email?token=${encodeURIComponent(token)}`;

  await sendTemplatedEmail({
    userId,
    eventType: "auth.verify_email",
    templateKey: "verify_email",
    emailTo: to,
    variables: {
      verifyUrl,
      title: "Verify your Limbu email",
      body: `Verify your email by visiting: ${verifyUrl}`,
    },
  });
}

export async function sendPasswordResetEmail(
  to: string,
  token: string,
  userId: string,
): Promise<void> {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;

  await sendTemplatedEmail({
    userId,
    eventType: "auth.password_reset",
    templateKey: "password_reset",
    emailTo: to,
    variables: {
      resetUrl,
      title: "Reset your Limbu password",
      body: `Reset your password by visiting: ${resetUrl}`,
    },
  });
}
