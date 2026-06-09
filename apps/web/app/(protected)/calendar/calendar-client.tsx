"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@limbu/ui/components/page-header";
import { EmptyState } from "@limbu/ui/components/empty-state";
import { fetchCalendarPosts, type PostItem } from "@/lib/gmb/client";

export function CalendarClient() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const from = new Date().toISOString();
    const to = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    fetchCalendarPosts(from, to)
      .then((r) => setPosts(r.posts))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: "var(--muted)" }}>Loading calendar…</p>;

  return (
    <div>
      <PageHeader
        title="Content Calendar"
        description="View and manage scheduled GMB posts."
        actionLabel="Schedule Post"
        actionHref="/posts/new"
      />

      {posts.length === 0 ? (
        <EmptyState
          icon="📅"
          title="No scheduled posts"
          description="Plan your month of GMB content with AI-powered scheduling."
          actionLabel="Create Post"
          actionHref="/posts/new"
        />
      ) : (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {posts.map((post) => (
            <div
              key={post.id}
              style={{
                display: "flex",
                gap: "1rem",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "1rem",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  minWidth: 80,
                  textAlign: "center",
                  padding: "0.5rem",
                  background: "rgba(99,102,241,0.1)",
                  borderRadius: 8,
                }}
              >
                <p style={{ fontWeight: 700, fontSize: "1.25rem" }}>
                  {post.scheduledAt ? new Date(post.scheduledAt).getDate() : "—"}
                </p>
                <p style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                  {post.scheduledAt
                    ? new Date(post.scheduledAt).toLocaleString("en", { month: "short" })
                    : ""}
                </p>
              </div>
              <div>
                <span
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--primary)",
                    textTransform: "uppercase",
                  }}
                >
                  {post.status}
                </span>
                <p style={{ fontSize: "0.9rem", marginTop: "0.25rem" }}>
                  {post.content.text?.slice(0, 120) ?? "Scheduled post"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
