"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchDashboardStats, type DashboardStats } from "@/lib/gmb/client";

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "1.25rem",
      }}
    >
      <p style={{ color: "var(--muted)", fontSize: "0.8rem", marginBottom: "0.25rem" }}>{label}</p>
      <p style={{ fontSize: "1.75rem", fontWeight: 700 }}>{value}</p>
      {sub && <p style={{ color: "var(--success)", fontSize: "0.8rem", marginTop: "0.25rem" }}>{sub}</p>}
    </div>
  );
}

export function DashboardClient({ userName }: { userName: string }) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats()
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p style={{ color: "var(--muted)" }}>Loading dashboard…</p>;
  }

  if (error) {
    return (
      <div style={{ color: "var(--danger)" }}>
        Failed to load dashboard: {error}. Ensure API is running on port 3002.
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Welcome back, {userName}</h1>
          <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
            {stats.hasIntegration
              ? "Your Google Business Profile is connected."
              : "Connect Google to unlock GMB automation."}
          </p>
        </div>
        {!stats.hasIntegration && (
          <Link
            href="/integrations"
            style={{
              padding: "0.625rem 1.25rem",
              background: "var(--primary)",
              color: "#fff",
              borderRadius: 8,
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Connect Google
          </Link>
        )}
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <StatCard label="Posts this week" value={stats.postsThisWeek} />
        <StatCard label="Pending reviews" value={stats.pendingReviews} />
        <StatCard label="Profile views" value={stats.viewsChange} sub="vs last week" />
        <StatCard label="Calls" value={stats.callsChange} sub="vs last week" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
        <section
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "1.25rem",
          }}
        >
          <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>Upcoming Posts</h2>
          {stats.upcomingPosts.length === 0 ? (
            <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>No scheduled posts yet.</p>
          ) : (
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {stats.upcomingPosts.map((p) => (
                <li key={p.id} style={{ fontSize: "0.875rem" }}>
                  <span style={{ color: "var(--muted)" }}>
                    {new Date(p.scheduledAt).toLocaleDateString()}
                  </span>
                  <p style={{ marginTop: "0.125rem" }}>{p.preview || "Scheduled post"}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "1.25rem",
          }}
        >
          <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>Recent Reviews</h2>
          {stats.recentReviews.length === 0 ? (
            <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
              No reviews yet.{" "}
              <Link href="/integrations">Connect Google</Link> to sync reviews.
            </p>
          ) : (
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {stats.recentReviews.map((r) => (
                <li key={r.id} style={{ fontSize: "0.875rem" }}>
                  <span>{"⭐".repeat(r.rating)}</span>
                  <p style={{ marginTop: "0.125rem", color: "var(--muted)" }}>
                    {r.text?.slice(0, 80) ?? "No text"} — {r.author ?? "Anonymous"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <Link
          href="/posts/new"
          style={{
            padding: "0.5rem 1rem",
            background: "var(--primary)",
            color: "#fff",
            borderRadius: 8,
            fontSize: "0.875rem",
            textDecoration: "none",
          }}
        >
          New Post
        </Link>
        <Link
          href="/reviews"
          style={{
            padding: "0.5rem 1rem",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: "0.875rem",
            textDecoration: "none",
            color: "var(--text)",
          }}
        >
          Reply Reviews
        </Link>
        <Link
          href="/calendar"
          style={{
            padding: "0.5rem 1rem",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: "0.875rem",
            textDecoration: "none",
            color: "var(--text)",
          }}
        >
          View Calendar
        </Link>
      </div>
    </div>
  );
}
