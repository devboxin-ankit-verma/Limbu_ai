"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Pref = {
  eventType: string;
  label: string;
  description: string;
  email: boolean;
  push: boolean;
  inApp: boolean;
};

export function NotificationPreferencesClient() {
  const [prefs, setPrefs] = useState<Pref[]>([]);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushStatus, setPushStatus] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/notifications/preferences");
    const data = await res.json();
    setPrefs(data.preferences ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function updatePref(eventType: string, field: "email" | "push" | "inApp", value: boolean) {
    await fetch("/api/notifications/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventType, [field]: value }),
    });
    await load();
  }

  async function enablePush() {
    setPushStatus(null);
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setPushStatus("Push notifications are not supported in this browser.");
      return;
    }

    const perm = await Notification.requestPermission();
    if (perm !== "granted") {
      setPushStatus("Notification permission denied.");
      return;
    }

    const keyRes = await fetch("/api/notifications/push");
    const { publicKey } = await keyRes.json();
    if (!publicKey) {
      setPushStatus("Push is not configured on the server (VAPID keys missing).");
      return;
    }

    const reg = await navigator.serviceWorker.register("/sw.js");
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });

    const json = sub.toJSON();
    await fetch("/api/notifications/push", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: json.endpoint,
        keys: json.keys,
        userAgent: navigator.userAgent,
      }),
    });

    setPushEnabled(true);
    setPushStatus("Push notifications enabled for this device.");
  }

  return (
    <div>
      <Link href="/notifications" style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
        ← Notification center
      </Link>
      <h1 style={{ margin: "1rem 0 0.5rem" }}>Notification preferences</h1>
      <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
        Control how you receive alerts across email, in-app, and push channels.
      </p>

      <section
        style={{
          marginBottom: "2rem",
          padding: "1rem",
          border: "1px solid var(--border)",
          borderRadius: 10,
          background: "var(--surface)",
        }}
      >
        <h2 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Push notifications</h2>
        <p style={{ fontSize: "0.875rem", color: "var(--muted)", marginBottom: "0.75rem" }}>
          Enable browser push for real-time alerts on this device.
        </p>
        {!pushEnabled && (
          <button
            type="button"
            onClick={() => void enablePush()}
            style={{
              padding: "0.5rem 1rem",
              border: "1px solid var(--border)",
              borderRadius: 8,
              background: "var(--text)",
              color: "var(--bg)",
              cursor: "pointer",
            }}
          >
            Enable push on this device
          </button>
        )}
        {pushStatus && (
          <p style={{ fontSize: "0.8rem", marginTop: "0.5rem", color: "var(--muted)" }}>{pushStatus}</p>
        )}
      </section>

      <div style={{ display: "grid", gap: "1rem" }}>
        {prefs.map((p) => (
          <div
            key={p.eventType}
            style={{
              padding: "1rem",
              border: "1px solid var(--border)",
              borderRadius: 10,
              background: "var(--surface)",
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{p.label}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "0.75rem" }}>
              {p.description}
            </div>
            <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
              {(
                [
                  ["inApp", "In-app"],
                  ["email", "Email"],
                  ["push", "Push"],
                ] as const
              ).map(([field, label]) => (
                <label key={field} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.875rem" }}>
                  <input
                    type="checkbox"
                    checked={p[field]}
                    onChange={(e) => void updatePref(p.eventType, field, e.target.checked)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}
