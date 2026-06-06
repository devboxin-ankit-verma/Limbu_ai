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
    throw error;
  }

  return { success: true };
}
