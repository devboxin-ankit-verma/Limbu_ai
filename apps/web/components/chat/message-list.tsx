"use client";

import { useEffect, useRef, useState } from "react";
import { MarkdownContent } from "./markdown-content";
import { useChat } from "./chat-provider";

export function MessageList({ threadId }: { threadId: string }) {
  const {
    state,
    loadOlderMessages,
    regenerateMessage,
    editMessage,
    setEditingMessageId,
  } = useChat();
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [initialScrollDone, setInitialScrollDone] = useState(false);

  useEffect(() => {
    setInitialScrollDone(false);
  }, [threadId]);

  useEffect(() => {
    if (!initialScrollDone && state.messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
      setInitialScrollDone(true);
    }
  }, [state.messages, initialScrollDone]);

  useEffect(() => {
    if (state.streaming && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [state.streaming, state.streamingContent]);

  return (
    <div
      ref={containerRef}
      className="chat-messages"
      onScroll={(e) => {
        const el = e.currentTarget;
        if (el.scrollTop < 80 && state.messagesHasMore && !state.messagesLoading) {
          void loadOlderMessages(threadId);
        }
      }}
    >
      <div className="chat-messages-inner">
        {state.messagesLoading && state.messages.length === 0 && (
          <p style={{ color: "var(--muted)", textAlign: "center" }}>Loading messages…</p>
        )}

        {state.messagesHasMore && (
          <p style={{ color: "var(--muted)", textAlign: "center", fontSize: "0.8rem" }}>
            {state.messagesLoading ? "Loading older messages…" : "Scroll up for older messages"}
          </p>
        )}

        {state.messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            editing={state.editingMessageId === message.id}
            onEdit={() => setEditingMessageId(message.id)}
            onCancelEdit={() => setEditingMessageId(null)}
            onSaveEdit={(content) => void editMessage(threadId, message.id, content)}
            onRegenerate={() => void regenerateMessage(threadId, message.id)}
          />
        ))}

        {state.streaming && (
          <div className="chat-message assistant">
            <div className="chat-avatar">AI</div>
            <div className="chat-bubble">
              <MarkdownContent content={state.streamingContent || "…"} />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  editing,
  onEdit,
  onCancelEdit,
  onSaveEdit,
  onRegenerate,
}: {
  message: {
    id: string;
    role: string;
    content: string;
  };
  editing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (content: string) => void;
  onRegenerate: () => void;
}) {
  const [draft, setDraft] = useState(message.content);
  const isUser = message.role === "user";

  useEffect(() => {
    setDraft(message.content);
  }, [message.content]);

  async function copyMessage() {
    await navigator.clipboard.writeText(message.content);
  }

  return (
    <div className={`chat-message ${isUser ? "user" : "assistant"}`}>
      <div className="chat-avatar">{isUser ? "You" : "AI"}</div>
      <div className="chat-bubble">
        {editing && isUser ? (
          <>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              style={{
                width: "100%",
                minHeight: 80,
                background: "transparent",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "0.5rem",
                color: "var(--text)",
              }}
            />
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
              <button type="button" className="chat-btn" onClick={() => onSaveEdit(draft)}>
                Save
              </button>
              <button type="button" className="chat-btn chat-btn-ghost" onClick={onCancelEdit}>
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <MarkdownContent content={message.content} />
            <div className="chat-message-actions">
              <button type="button" onClick={() => void copyMessage()}>
                Copy
              </button>
              {isUser && (
                <button type="button" onClick={onEdit}>
                  Edit
                </button>
              )}
              {!isUser && (
                <button type="button" onClick={onRegenerate}>
                  Regenerate
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
