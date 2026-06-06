"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type NotificationItem = {
  id: string;
  type: string;
  eventType: string | null;
  payload: { title?: string; body?: string; actionUrl?: string };
  readAt: string | null;
  createdAt: string;
};

type DeliveryItem = {
  id: string;
  channel: string;
  templateKey: string | null;
  status: string;
  createdAt: string;
  sentAt: string | null;
};

export function NotificationCenterClient() {
  const [tab, setTab] = useState<"inbox" | "deliveries">("inbox");
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const loadInbox = useCallback(async () => {
    const q = filter === "unread" ? "?unreadOnly=true&limit=50" : "?limit=50";
    const res = await fetch(`/api/notifications${q}`);
    const data = await res.json();
    setItems(data.items ?? []);
  }, [filter]);

  const loadDeliveries = useCallback(async () => {
    const res = await fetch("/api/notifications/deliveries?limit=50");
    const data = await res.json();
    setDeliveries(data.items ?? []);
  }, []);

  useEffect(() => {
    if (tab === "inbox") void loadInbox();
    else void loadDeliveries();
  }, [tab, loadInbox, loadDeliveries]);

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    await loadInbox();
  }

  async function markAllRead() {
    await fetch("/api/notifications/read-all", { method: "POST" });
    await loadInbox();
  }

  return (
    <div>
      <header style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ marginBottom: "0.25rem" }}>Notification Center</h1>
          <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
            In-app alerts and delivery history across email, push, and workflow channels.
          </p>
        </div>
        <Link href="/settings/notifications" style={{ fontSize: "0.875rem", alignSelf: "start" }}>
          Preferences →
        </Link>
      </header>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        {(["inbox", "deliveries"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            style={{
              padding: "0.4rem 0.9rem",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: tab === t ? "var(--text)" : "transparent",
              color: tab === t ? "var(--bg)" : "var(--text)",
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "inbox" && (
        <>
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
            {(["all", "unread"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                style={{
                  padding: "0.3rem 0.75rem",
                  borderRadius: 6,
                  border: "1px solid var(--border)",
                  background: filter === f ? "var(--surface)" : "transparent",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                }}
              >
                {f === "all" ? "All" : "Unread"}
              </button>
            ))}
            <button
              type="button"
              onClick={() => void markAllRead()}
              style={{
                marginLeft: "auto",
                padding: "0.3rem 0.75rem",
                borderRadius: 6,
                border: "1px solid var(--border)",
                background: "transparent",
                cursor: "pointer",
                fontSize: "0.8rem",
              }}
            >
              Mark all read
            </button>
          </div>

          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {items.map((n) => (
              <li
                key={n.id}
                style={{
                  padding: "1rem",
                  marginBottom: "0.5rem",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  background: n.readAt ? "var(--surface)" : "var(--bg)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{n.payload.title ?? n.type}</div>
                    {n.payload.body && (
                      <p style={{ color: "var(--muted)", fontSize: "0.875rem", marginTop: 4 }}>
                        {n.payload.body}
                      </p>
                    )}
                    <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 6 }}>
                      {n.eventType ?? n.type} · {new Date(n.createdAt).toLocaleString()}
                    </div>
                  </div>
                  {!n.readAt && (
                    <button
                      type="button"
                      onClick={() => void markRead(n.id)}
                      style={{
                        alignSelf: "start",
                        padding: "0.25rem 0.6rem",
                        border: "1px solid var(--border)",
                        borderRadius: 6,
                        background: "transparent",
                        cursor: "pointer",
                        fontSize: "0.75rem",
                      }}
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </li>
            ))}
            {items.length === 0 && (
              <p style={{ color: "var(--muted)" }}>No notifications to show.</p>
            )}
          </ul>
        </>
      )}

      {tab === "deliveries" && (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr>
              <th style={th}>Channel</th>
              <th style={th}>Template</th>
              <th style={th}>Status</th>
              <th style={th}>Sent</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.map((d) => (
              <tr key={d.id}>
                <td style={td}>{d.channel}</td>
                <td style={td}>{d.templateKey ?? "—"}</td>
                <td style={td}>{d.status}</td>
                <td style={td}>
                  {d.sentAt ? new Date(d.sentAt).toLocaleString() : new Date(d.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "0.6rem",
  borderBottom: "1px solid var(--border)",
  color: "var(--muted)",
};

const td: React.CSSProperties = {
  padding: "0.6rem",
  borderBottom: "1px solid var(--border)",
};
