import { ChatShell } from "@/components/chat/chat-shell";

export const dynamic = "force-dynamic";

export default function ChatHomePage() {
  return (
    <ChatShell activeThreadId={null}>
      <div className="chat-empty">
        <div>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem", color: "var(--text)" }}>
            How can I help you today?
          </h2>
          <p>Start a new conversation or pick one from the sidebar.</p>
        </div>
      </div>
    </ChatShell>
  );
}
