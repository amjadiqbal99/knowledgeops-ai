"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";

import { signIn } from "@/lib/auth";

export async function loginAction(_: { error?: string } | undefined, formData: FormData) {
  try {
    await signIn("credentials", {
      redirectTo: "/dashboard",
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || ""),
    });
    return {};
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    return { error: "Invalid credentials. Use one of the seeded accounts from the README." };
  }
}
