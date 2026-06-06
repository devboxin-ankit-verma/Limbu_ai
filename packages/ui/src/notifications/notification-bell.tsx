"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type NotificationItem = {
  id: string;
  type: string;
  payload: { title?: string; body?: string; actionUrl?: string };
  readAt: string | null;
  createdAt: string;
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const loadCount = useCallback(async () => {
    const res = await fetch("/api/notifications/unread-count");
    const data = await res.json();
    setCount(data.count ?? 0);
  }, []);

  const loadItems = useCallback(async () => {
    const res = await fetch("/api/notifications?limit=8");
    const data = await res.json();
    setItems(data.items ?? []);
  }, []);

  useEffect(() => {
    void loadCount();
    const id = setInterval(() => void loadCount(), 60000);
    return () => clearInterval(id);
  }, [loadCount]);

  useEffect(() => {
    if (open) void loadItems();
  }, [open, loadItems]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    await loadCount();
    await loadItems();
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        style={{
          position: "relative",
          padding: "0.4rem 0.6rem",
          border: "1px solid var(--border)",
          borderRadius: 8,
          background: "var(--surface)",
          color: "var(--text)",
          cursor: "pointer",
        }}
      >
        🔔
        {count > 0 && (
          <span
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              background: "var(--danger, #e11)",
              color: "#fff",
              borderRadius: 999,
              fontSize: "0.65rem",
              minWidth: 16,
              height: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 4px",
            }}
          >
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 0.5rem)",
            width: 360,
            maxHeight: 420,
            overflow: "auto",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            zIndex: 100,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0.75rem 1rem",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <strong style={{ fontSize: "0.9rem" }}>Notifications</strong>
            <Link href="/notifications" style={{ fontSize: "0.8rem" }} onClick={() => setOpen(false)}>
              View all
            </Link>
          </div>

          {items.length === 0 ? (
            <p style={{ padding: "1rem", color: "var(--muted)", fontSize: "0.875rem" }}>
              No notifications yet.
            </p>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {items.map((n) => (
                <li
                  key={n.id}
                  style={{
                    padding: "0.75rem 1rem",
                    borderBottom: "1px solid var(--border)",
                    background: n.readAt ? "transparent" : "var(--bg)",
                  }}
                >
                  <div style={{ fontWeight: n.readAt ? 400 : 600, fontSize: "0.875rem" }}>
                    {n.payload.title ?? n.type}
                  </div>
                  {n.payload.body && (
                    <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 2 }}>
                      {n.payload.body.slice(0, 120)}
                    </div>
                  )}
                  <div style={{ marginTop: 6, display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                    {!n.readAt && (
                      <button
                        type="button"
                        onClick={() => void markRead(n.id)}
                        style={{
                          fontSize: "0.7rem",
                          border: "none",
                          background: "none",
                          color: "var(--text)",
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
