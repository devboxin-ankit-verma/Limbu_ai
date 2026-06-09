"use server";

import { signIn } from "@/auth";
import { loginSchema } from "@limbu/shared/validators";
import type { ActionResult } from "@limbu/shared/types";
import { AuthError } from "next-auth";

export type { ActionResult };

export async function loginAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Invalid credentials" };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/",
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

    const message = error instanceof Error ? error.message : "";
    if (message.includes("does not exist in the current database")) {
      return {
        error: "Database is not set up. Run npm run db:setup:local from the repo root.",
      };
    }

    console.error("[admin login]", error);
    return { error: "Sign-in failed. Check database connection and try again." };
  }

  return { success: true };
}
