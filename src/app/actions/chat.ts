"use server";

import { createClient } from "@/lib/supabase/server";

export type SendMessageState = { error?: string } | null;

export async function sendMessage(
  _prev: SendMessageState,
  formData: FormData,
): Promise<SendMessageState> {
  const body = (formData.get("body") as string | null)?.trim() ?? "";
  if (!body) return { error: "Message cannot be empty." };
  if (body.length > 2000) return { error: "Message is too long." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Not authenticated." };

  const { data, error } = await supabase
    .from("chat_messages")
    .insert({ user_id: user.id, user_email: user.email, body })
    .select()
    .single();

  if (data) {
    const channel = supabase.channel("chat_messages");
    channel.subscribe((status, err) => {
      if (status === "SUBSCRIBED") {
        console.log("[action] channel subscribed", data, error);
        channel.send({
          type: "broadcast",
          event: "new_message",
          payload: { data },
        });
      }
    });
  }
  return { error: error?.message };
}
