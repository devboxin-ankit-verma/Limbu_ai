"use server";

import { signIn, signOut, unstable_update } from "@/auth";
import {
  registerUser,
  requestPasswordReset,
  resetPassword,
  resendVerificationEmail,
  switchTenantContext,
  verifyEmailToken,
} from "@limbu/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { loginSchema, registerSchema } from "@limbu/shared/validators";
import type { ActionResult } from "@limbu/shared/types";

export type { ActionResult };

export async function registerAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name") || undefined,
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const result = await registerUser(parsed.data);
  if ("error" in result) return { error: result.error };

  redirect("/verify-email?registered=1");
}

export async function loginAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    callbackUrl: formData.get("callbackUrl") || undefined,
  });

  if (!parsed.success) {
    return { error: "Invalid credentials" };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: parsed.data.callbackUrl ?? "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        if ((error as AuthError & { code?: string }).code === "EMAIL_NOT_VERIFIED") {
          return { error: "Please verify your email before signing in." };
        }
        return { error: "Invalid email or password" };
      }
    }
    throw error;
  }

  return { success: true };
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}

export async function verifyEmailAction(token: string): Promise<ActionResult> {
  if (!token) return { error: "Missing verification token" };
  const result = await verifyEmailToken(token);
  if ("error" in result) return { error: result.error };
  return { success: true };
}

export async function resendVerificationAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const email = formData.get("email");
  if (typeof email !== "string" || !email) {
    return { error: "Email is required" };
  }

  const result = await resendVerificationEmail(email);
  if ("error" in result) return { error: result.error };
  return { success: true };
}

export async function forgotPasswordAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const email = formData.get("email");
  if (typeof email !== "string" || !email) {
    return { error: "Email is required" };
  }

  await requestPasswordReset(email);
  return { success: true };
}

export async function resetPasswordAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const token = formData.get("token");
  const password = formData.get("password");
  const confirm = formData.get("confirmPassword");

  if (typeof token !== "string" || !token) return { error: "Invalid reset link" };
  if (typeof password !== "string" || password !== confirm) {
    return { error: "Passwords do not match" };
  }

  const result = await resetPassword(token, password);
  if ("error" in result) return { error: result.error };

  redirect("/login?reset=1");
}

export async function switchTenantAction(input: {
  organizationId: string;
  workspaceId?: string;
}): Promise<ActionResult> {
  const { auth } = await import("@/auth");
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  try {
    const ctx = await switchTenantContext(
      session.user.id,
      input.organizationId,
      input.workspaceId,
    );

    await unstable_update({
      organizationId: ctx.organizationId,
      orgRole: ctx.orgRole,
      workspaceId: ctx.workspaceId,
      workspaceRole: ctx.workspaceRole,
    } as Parameters<typeof unstable_update>[0]);

    return { success: true };
  } catch {
    return { error: "Access denied" };
  }
}
