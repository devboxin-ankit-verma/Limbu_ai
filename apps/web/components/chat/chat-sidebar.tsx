"use client";

import Link from "next/link";
import { useChat } from "./chat-provider";

function formatRelative(date: Date | string | null) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function ChatSidebar() {
  const {
    state,
    activeThreadId,
    createConversation,
    renameConversation,
    deleteConversation,
    archiveConversation,
    pinConversation,
    setSearchQuery,
    setShowArchived,
    setSidebarOpen,
    loadMoreThreads,
  } = useChat();

  const pinned = state.threads.filter((t) => t.pinnedAt);
  const regular = state.threads.filter((t) => !t.pinnedAt);

  return (
    <>
      {state.sidebarOpen && (
        <button
          type="button"
          className="chat-overlay"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside className={`chat-sidebar ${state.sidebarOpen ? "open" : ""}`}>
        <div className="chat-sidebar-header">
          <button type="button" className="chat-btn" onClick={() => void createConversation()}>
            New chat
          </button>
          <input
            className="chat-search"
            placeholder="Search conversations…"
            value={state.searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="button"
            className="chat-btn chat-btn-ghost"
            onClick={() => setShowArchived(!state.showArchived)}
          >
            {state.showArchived ? "Show active" : "Archived"}
          </button>
        </div>

        <div
          className="chat-thread-list"
          onScroll={(e) => {
            const el = e.currentTarget;
            if (el.scrollTop + el.clientHeight >= el.scrollHeight - 24) {
              void loadMoreThreads();
            }
          }}
        >
          {!state.showArchived && pinned.length > 0 && (
            <>
              <div className="chat-section-label">Pinned</div>
              {pinned.map((thread) => (
                <ThreadItem
                  key={thread.id}
                  thread={thread}
                  active={thread.id === activeThreadId}
                  onNavigate={() => setSidebarOpen(false)}
                  onRename={renameConversation}
                  onDelete={deleteConversation}
                  onArchive={archiveConversation}
                  onPin={pinConversation}
                />
              ))}
            </>
          )}

          <div className="chat-section-label">
            {state.showArchived ? "Archived" : "Recent"}
          </div>
          {state.threadsLoading && state.threads.length === 0 ? (
            <p style={{ padding: "0.75rem", color: "var(--muted)", fontSize: "0.875rem" }}>
              Loading…
            </p>
          ) : regular.length === 0 && pinned.length === 0 ? (
            <p style={{ padding: "0.75rem", color: "var(--muted)", fontSize: "0.875rem" }}>
              No conversations yet.
            </p>
          ) : (
            regular.map((thread) => (
              <ThreadItem
                key={thread.id}
                thread={thread}
                active={thread.id === activeThreadId}
                onNavigate={() => setSidebarOpen(false)}
                onRename={renameConversation}
                onDelete={deleteConversation}
                onArchive={archiveConversation}
                onPin={pinConversation}
              />
            ))
          )}
        </div>
      </aside>
    </>
  );
}

function ThreadItem({
  thread,
  active,
  onNavigate,
  onRename,
  onDelete,
  onArchive,
  onPin,
}: {
  thread: {
    id: string;
    title: string | null;
    summary: string | null;
    lastMessageAt: Date | string | null;
    pinnedAt: Date | string | null;
  };
  active: boolean;
  onNavigate: () => void;
  onRename: (id: string, title: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onArchive: (id: string, archived: boolean) => Promise<void>;
  onPin: (id: string, pinned: boolean) => Promise<void>;
}) {
  return (
    <div className={`chat-thread-item ${active ? "active" : ""}`}>
      <Link href={`/chat/${thread.id}`} onClick={onNavigate} style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {thread.title ?? "Untitled"}
        </div>
        <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 2 }}>
          {formatRelative(thread.lastMessageAt)}
        </div>
      </Link>
      <div style={{ display: "flex", gap: 2 }}>
        <button
          type="button"
          title={thread.pinnedAt ? "Unpin" : "Pin"}
          onClick={() => void onPin(thread.id, !thread.pinnedAt)}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}
        >
          📌
        </button>
        <button
          type="button"
          title="Rename"
          onClick={() => {
            const title = window.prompt("Rename conversation", thread.title ?? "");
            if (title?.trim()) void onRename(thread.id, title.trim());
          }}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}
        >
          ✎
        </button>
        <button
          type="button"
          title="Archive"
          onClick={() => void onArchive(thread.id, true)}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}
        >
          ⌂
        </button>
        <button
          type="button"
          title="Delete"
          onClick={() => {
            if (window.confirm("Delete this conversation?")) void onDelete(thread.id);
          }}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)" }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
