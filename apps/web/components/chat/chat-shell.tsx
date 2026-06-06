"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ChatProvider, useChat } from "./chat-provider";
import { ChatSidebar } from "./chat-sidebar";
import { Composer } from "./composer";
import { MessageList } from "./message-list";

function KeyboardShortcuts() {
  const { createConversation, setSidebarOpen, state } = useChat();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "n") {
        e.preventDefault();
        void createConversation();
      }
      if (mod && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setSidebarOpen(!state.sidebarOpen);
      }
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSidebarOpen(true);
        const input = document.querySelector<HTMLInputElement>(".chat-search");
        input?.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [createConversation, setSidebarOpen, state.sidebarOpen]);

  return null;
}

export function ChatShell({
  activeThreadId,
  children,
}: {
  activeThreadId: string | null;
  children?: React.ReactNode;
}) {
  return (
    <ChatProvider activeThreadId={activeThreadId}>
      <ChatShellInner activeThreadId={activeThreadId}>{children}</ChatShellInner>
    </ChatProvider>
  );
}

function ChatShellInner({
  activeThreadId,
  children,
}: {
  activeThreadId: string | null;
  children?: React.ReactNode;
}) {
  const { setSidebarOpen } = useChat();

  return (
    <div className="chat-root">
      <KeyboardShortcuts />
      <ChatSidebar />
      <div className="chat-main">
        <header
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.75rem 1rem",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <button
            type="button"
            className="chat-btn chat-btn-ghost chat-mobile-toggle"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
          <strong style={{ flex: 1 }}>Limbu Chat</strong>
          <Link href="/dashboard" style={{ fontSize: "0.875rem", color: "var(--text)" }}>
            Dashboard
          </Link>
        </header>

        {activeThreadId ? <MessageList threadId={activeThreadId} /> : children}
        <Composer threadId={activeThreadId} />
      </div>
    </div>
  );
}
