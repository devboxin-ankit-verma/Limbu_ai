"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@limbu/ui/components/page-header";
import { EmptyState } from "@limbu/ui/components/empty-state";
import {
  fetchReviews,
  publishReviewReply,
  suggestReviewReply,
  type ReviewItem,
} from "@/lib/gmb/client";

export function ReviewsClient() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState("");
  const [busy, setBusy] = useState(false);

  function load() {
    fetchReviews()
      .then((r) => setReviews(r.reviews))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSuggest(reviewId: string) {
    setActiveId(reviewId);
    setBusy(true);
    try {
      const { suggestion: text } = await suggestReviewReply(reviewId);
      setSuggestion(text);
    } catch {
      setSuggestion("Thank you for your feedback!");
    } finally {
      setBusy(false);
    }
  }

  async function handlePublish(reviewId: string) {
    setBusy(true);
    try {
      await publishReviewReply(reviewId, suggestion);
      setSuggestion("");
      setActiveId(null);
      load();
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p style={{ color: "var(--muted)" }}>Loading reviews…</p>;

  return (
    <div>
      <PageHeader
        title="Review Inbox"
        description="Manage and reply to Google reviews with AI assistance."
      />

      {reviews.length === 0 ? (
        <EmptyState
          icon="⭐"
          title="No reviews yet"
          description="Connect Google Business Profile and sync reviews to get started."
          actionLabel="Connect Google"
          actionHref="/integrations"
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {reviews.map((review) => (
            <div
              key={review.id}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "1.25rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span>{"⭐".repeat(review.rating)}</span>
                <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                  {review.author ?? "Anonymous"} · {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p style={{ fontSize: "0.9rem", marginBottom: "0.75rem" }}>
                {review.text ?? "(No review text)"}
              </p>
              {review.reply ? (
                <p style={{ fontSize: "0.85rem", color: "var(--success)" }}>
                  Replied: {review.reply.content.slice(0, 100)}…
                </p>
              ) : (
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => handleSuggest(review.id)}
                    disabled={busy}
                    style={{
                      padding: "0.375rem 0.75rem",
                      background: "var(--primary)",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      fontSize: "0.8rem",
                      cursor: "pointer",
                    }}
                  >
                    AI Suggest Reply
                  </button>
                </div>
              )}
              {activeId === review.id && suggestion && (
                <div style={{ marginTop: "0.75rem" }}>
                  <textarea
                    value={suggestion}
                    onChange={(e) => setSuggestion(e.target.value)}
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                      background: "var(--bg)",
                      color: "var(--text)",
                      marginBottom: "0.5rem",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handlePublish(review.id)}
                    disabled={busy}
                    style={{
                      padding: "0.375rem 0.75rem",
                      border: "1px solid var(--success)",
                      color: "var(--success)",
                      background: "transparent",
                      borderRadius: 6,
                      fontSize: "0.8rem",
                      cursor: "pointer",
                    }}
                  >
                    Publish Reply
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
