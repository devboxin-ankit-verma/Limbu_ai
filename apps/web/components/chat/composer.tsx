"use client";

import { createThreadApi } from "@/lib/chat/client";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useChat } from "./chat-provider";

export function Composer({ threadId }: { threadId: string | null }) {
  const { sendMessage, state, refreshThreads } = useChat();
  const router = useRouter();
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function handleSubmit() {
    const content = value.trim();
    if (!content || sending || state.streaming) return;

    setSending(true);
    setValue("");
    try {
      if (!threadId) {
        const thread = await createThreadApi();
        sessionStorage.setItem("pendingChatMessage", content);
        await refreshThreads();
        router.push(`/chat/${thread.id}`);
        return;
      }
      await sendMessage(threadId, content);
    } catch (err) {
      setValue(content);
      console.error(err);
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  }

  return (
    <div className="chat-composer-wrap">
      {state.error && (
        <p style={{ color: "var(--danger)", fontSize: "0.875rem", maxWidth: 820, margin: "0 auto 0.5rem" }}>
          {state.error}
        </p>
      )}
      <form
        className="chat-composer"
        onSubmit={(e) => {
          e.preventDefault();
          void handleSubmit();
        }}
      >
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder={threadId ? "Message Limbu…" : "Start a new conversation…"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void handleSubmit();
            }
          }}
          disabled={sending || state.streaming}
        />
        <button
          type="submit"
          className="chat-btn"
          disabled={!value.trim() || sending || state.streaming}
        >
          Send
        </button>
      </form>
      <p style={{ maxWidth: 820, margin: "0.5rem auto 0", color: "var(--muted)", fontSize: "0.75rem" }}>
        Enter to send · Shift+Enter for newline · ⌘N new chat · ⌘K search · ⌘B toggle sidebar
      </p>
    </div>
  );
}
