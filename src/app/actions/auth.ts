"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { loginSchema } from "@/lib/validations/auth";

export type LoginState = {
  error?: string;
  fieldErrors?: { email?: string[]; password?: string[] };
} | null;

function mapAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials") || lower.includes("invalid_grant")) {
    return "Invalid email or password.";
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

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
