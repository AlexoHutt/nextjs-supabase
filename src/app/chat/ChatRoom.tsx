"use client";

import { useEffect, useRef, useState, useActionState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { sendMessage, type SendMessageState } from "@/app/actions/chat";
import { type Message } from "@/lib/types/chat";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Props = {
  currentUserId: string;
  currentUserEmail: string;
  initialMessages: Message[];
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatRoom({
  currentUserId,
  currentUserEmail,
  initialMessages,
}: Readonly<Props>) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [state, formAction, pending] = useActionState<
    SendMessageState,
    FormData
  >(sendMessage, null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (state === null && !pending) {
      formRef.current?.reset();
    }
  }, [state, pending]);

  function addNewMessage(payload: Message) {
    const newMsg = payload;
    setMessages((prev) =>
      prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg],
    );
  }

  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      if (session) supabase.realtime.setAuth(session.access_token);

      channel = supabase
        .channel("chat_messages")
        .on("broadcast", { event: "new_message" }, (payload) => {
          console.log("[realtime] new_message", payload);
          addNewMessage(payload.payload.data);
        })
        .subscribe((status, err) => {
          console.log("[realtime] status", status, err ?? "");
        });
    });

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          Global Chat
        </h1>
        <nav className="flex items-center gap-3 text-sm">
          <Link
            href="/dashboard"
            className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Dashboard
          </Link>
          <span className="text-zinc-300 dark:text-zinc-700">·</span>
          <span className="max-w-[180px] truncate text-zinc-500 dark:text-zinc-400">
            {currentUserEmail}
          </span>
        </nav>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto flex max-w-2xl flex-col gap-3">
          {messages.length === 0 && (
            <p className="py-8 text-center text-sm text-zinc-400 dark:text-zinc-600">
              No messages yet. Say hello!
            </p>
          )}
          {messages.map((msg) => {
            const isOwn = msg.user_id === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex flex-col gap-0.5 ${isOwn ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500">
                  <span className="font-medium text-zinc-600 dark:text-zinc-300">
                    {isOwn ? "You" : msg.user_email}
                  </span>
                  <span suppressHydrationWarning>
                    {formatTime(msg.created_at)}
                  </span>
                </div>
                <div
                  className={`max-w-xs break-words rounded-xl px-3 py-2 text-sm leading-relaxed lg:max-w-md ${
                    isOwn
                      ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                      : "bg-white text-zinc-900 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-50 dark:ring-zinc-700"
                  }`}
                >
                  {msg.body}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </main>

      <footer className="sticky bottom-0 border-t border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-2xl">
          {state?.error && (
            <Alert variant="destructive" className="mb-2">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          <form
            ref={formRef}
            action={formAction}
            className="flex items-end gap-2"
          >
            <Textarea
              name="body"
              placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
              rows={1}
              maxLength={2000}
              required
              disabled={pending}
              onKeyDown={handleKeyDown}
              className="min-h-[36px] max-h-32 flex-1 resize-none"
            />
            <Button type="submit" disabled={pending}>
              {pending ? "Sending…" : "Send"}
            </Button>
          </form>
        </div>
      </footer>
    </div>
  );
}
