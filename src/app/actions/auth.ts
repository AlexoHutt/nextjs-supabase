"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { loginSchema, signupSchema } from "@/lib/validations/auth";

export type LoginState = {
  error?: string;
  fieldErrors?: { email?: string[]; password?: string[] };
} | null;

function mapAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials") || lower.includes("invalid_grant")) {
    return "Invalid email or password.";
  }
  if (lower.includes("user already registered") || lower.includes("already exists")) {
    return "An account with this email already exists.";
  }
  if (lower.includes("fetch failed") || lower.includes("failed to fetch") || lower.includes("network")) {
    return "Unable to reach the server. Please try again.";
  }
  return message;
}

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const tree = z.treeifyError(parsed.error);
    console.log(tree);
    return {
      fieldErrors: {
        email: tree.properties?.email?.errors,
        password: tree.properties?.password?.errors,
      },
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    console.log(error);
    return { fieldErrors: { password: [mapAuthError(error.message)] } };
  }

  redirect("/dashboard");
}

export type SignupState = {
  error?: string;
  fieldErrors?: { email?: string[]; password?: string[]; confirmPassword?: string[] };
} | null;

export async function signup(
  _prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    const tree = z.treeifyError(parsed.error);
    return {
      fieldErrors: {
        email: tree.properties?.email?.errors,
        password: tree.properties?.password?.errors,
        confirmPassword: tree.properties?.confirmPassword?.errors,
      },
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: mapAuthError(error.message) };
  }

  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
