"use server"

import { createClient } from "@/lib/supabase/server"

export type SendMessageState = { error?: string } | null

export async function sendMessage(
  _prev: SendMessageState,
  formData: FormData
): Promise<SendMessageState> {
  const body = (formData.get("body") as string | null)?.trim() ?? ""
  if (!body) return { error: "Message cannot be empty." }
  if (body.length > 2000) return { error: "Message is too long." }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.email) return { error: "Not authenticated." }

  const { error } = await supabase
    .from("messages")
    .insert({ user_id: user.id, user_email: user.email, body })

  if (error) return { error: "Failed to send message. Please try again." }
  return null
}
