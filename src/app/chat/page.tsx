import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { type Message } from "@/lib/types/chat";
import ChatRoom from "./ChatRoom";

export default async function ChatPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: initialMessages } = await supabase
    .from("chat_messages")
    .select("id, user_id, user_email, body, created_at")
    .order("created_at", { ascending: true })
    .limit(50);

  return (
    <ChatRoom
      currentUserId={user.id}
      currentUserEmail={user.email ?? ""}
      initialMessages={(initialMessages ?? []) as Message[]}
    />
  );
}
