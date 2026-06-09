"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHeader } from "@limbu/ui/components/page-header";
import { EmptyState } from "@limbu/ui/components/empty-state";
import { fetchPosts, type PostItem } from "@/lib/gmb/client";

export function PostsClient() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts()
      .then((r) => setPosts(r.posts))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: "var(--muted)" }}>Loading posts…</p>;

  return (
    <div>
      <PageHeader
        title="Posts"
        description="Create and manage your Google Business Profile posts."
        actionLabel="New Post"
        actionHref="/posts/new"
      />

      {posts.length === 0 ? (
        <EmptyState
          icon="✨"
          title="No posts yet"
          description="Create your first AI-powered GMB post to boost local visibility."
          actionLabel="Create Post"
          actionHref="/posts/new"
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {posts.map((post) => (
            <div
              key={post.id}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "1rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span
                  style={{
                    fontSize: "0.75rem",
                    padding: "0.125rem 0.5rem",
                    borderRadius: 4,
                    background: "rgba(99,102,241,0.15)",
                    color: "var(--primary)",
                  }}
                >
                  {post.status}
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p style={{ fontSize: "0.9rem" }}>{post.content.text?.slice(0, 200) ?? "Draft post"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
