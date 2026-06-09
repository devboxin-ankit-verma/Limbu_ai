"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageHeader } from "@limbu/ui/components/page-header";
import { createPost, generatePostContent, schedulePost } from "@/lib/gmb/client";

export function PostComposer() {
  const router = useRouter();
  const [keywords, setKeywords] = useState("");
  const [tone, setTone] = useState("professional");
  const [content, setContent] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [postId, setPostId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      let id = postId;
      if (!id) {
        const { post } = await createPost({ content: { text: "", keywords } });
        id = post.id;
        setPostId(id);
      }
      const { post } = await generatePostContent(id!, { keywords, tone });
      setContent(post.content.text ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleSchedule() {
    if (!postId || !scheduledAt) return;
    setLoading(true);
    setError(null);
    try {
      if (content) {
        await fetch(`/api/posts/${postId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: { text: content, keywords, tone } }),
        });
      }
      await schedulePost(postId, new Date(scheduledAt).toISOString());
      router.push("/calendar");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Schedule failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader title="AI Post Composer" description="Generate engaging GMB posts with AI." />

      {error && <p style={{ color: "var(--danger)", marginBottom: "1rem" }}>{error}</p>}

      <div
        style={{
          display: "grid",
          gap: "1rem",
          maxWidth: 640,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "1.5rem",
        }}
      >
        <label style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>Keywords / Topic</span>
          <input
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="e.g. summer sale, new menu items"
            style={{
              padding: "0.625rem",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--bg)",
              color: "var(--text)",
            }}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>Tone</span>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            style={{
              padding: "0.625rem",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--bg)",
              color: "var(--text)",
            }}
          >
            <option value="professional">Professional</option>
            <option value="friendly">Friendly</option>
            <option value="promotional">Promotional</option>
          </select>
        </label>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading || !keywords}
          style={{
            padding: "0.625rem 1rem",
            background: "var(--primary)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: loading ? "wait" : "pointer",
            fontWeight: 500,
          }}
        >
          {loading ? "Generating…" : "Generate with AI"}
        </button>

        {content && (
          <label style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>Post Content</span>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              style={{
                padding: "0.625rem",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--bg)",
                color: "var(--text)",
                resize: "vertical",
              }}
            />
          </label>
        )}

        {content && (
          <>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>Schedule for</span>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                style={{
                  padding: "0.625rem",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "var(--bg)",
                  color: "var(--text)",
                }}
              />
            </label>
            <button
              type="button"
              onClick={handleSchedule}
              disabled={loading || !scheduledAt}
              style={{
                padding: "0.625rem 1rem",
                border: "1px solid var(--primary)",
                color: "var(--primary)",
                background: "transparent",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Schedule Post
            </button>
          </>
        )}
      </div>
    </div>
  );
}
