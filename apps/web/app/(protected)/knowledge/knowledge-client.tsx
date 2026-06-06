"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type KnowledgeBase = {
  id: string;
  scope: "workspace" | "organization" | "personal";
  name: string;
  description: string | null;
  isDefault: boolean;
  documentCount?: number;
};

type KnowledgeDocument = {
  id: string;
  filename: string;
  title: string | null;
  status: string;
  chunkCount: number;
  error: string | null;
  fileSize: number | null;
  processedAt: string | null;
  createdAt: string;
};

const SCOPE_LABELS: Record<KnowledgeBase["scope"], string> = {
  workspace: "Workspace",
  organization: "Organization",
  personal: "Personal",
};

const STATUS_COLORS: Record<string, string> = {
  ready: "#16a34a",
  processing: "#ca8a04",
  reprocessing: "#ca8a04",
  uploading: "#64748b",
  failed: "#dc2626",
};

export function KnowledgePageClient({
  organizationId,
  workspaceId,
}: {
  organizationId: string;
  workspaceId: string;
}) {
  const [bases, setBases] = useState<KnowledgeBase[]>([]);
  const [selectedBaseId, setSelectedBaseId] = useState<string>("");
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    Array<{ citationKey: string; filename: string; excerpt: string; score: number }>
  >([]);
  const [error, setError] = useState<string | null>(null);

  const selectedBase = useMemo(
    () => bases.find((base) => base.id === selectedBaseId) ?? null,
    [bases, selectedBaseId],
  );

  const loadBases = useCallback(async () => {
    const response = await fetch("/api/knowledge/bases");
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? "Failed to load knowledge bases");
    setBases(data.bases);
    if (!selectedBaseId && data.bases[0]?.id) {
      setSelectedBaseId(data.bases[0].id);
    }
  }, [selectedBaseId]);

  const loadDocuments = useCallback(async (baseId: string) => {
    const response = await fetch(`/api/knowledge/bases/${baseId}/documents`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? "Failed to load documents");
    setDocuments(data.documents);
  }, []);

  useEffect(() => {
    loadBases()
      .catch((err) => setError(err instanceof Error ? err.message : "Load failed"))
      .finally(() => setLoading(false));
  }, [loadBases]);

  useEffect(() => {
    if (!selectedBaseId) return;
    loadDocuments(selectedBaseId).catch((err) =>
      setError(err instanceof Error ? err.message : "Load failed"),
    );
  }, [selectedBaseId, loadDocuments]);

  async function handleUpload(file: File) {
    if (!selectedBaseId) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`/api/knowledge/bases/${selectedBaseId}/documents/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Upload failed");
      await loadDocuments(selectedBaseId);
      await loadBases();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleReindex(documentId: string) {
    setError(null);
    const response = await fetch(`/api/knowledge/documents/${documentId}/reindex`, {
      method: "POST",
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? "Re-index failed");
    if (selectedBaseId) await loadDocuments(selectedBaseId);
  }

  async function handleDelete(documentId: string) {
    if (!confirm("Delete this document and its indexed chunks?")) return;
    setError(null);
    const response = await fetch(`/api/knowledge/documents/${documentId}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? "Delete failed");
    if (selectedBaseId) {
      await loadDocuments(selectedBaseId);
      await loadBases();
    }
  }

  async function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    if (!searchQuery.trim()) return;
    setError(null);
    const response = await fetch("/api/knowledge/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: searchQuery,
        knowledgeBaseIds: selectedBaseId ? [selectedBaseId] : undefined,
        hybrid: true,
        topK: 5,
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? "Search failed");
    setSearchResults(data.citations ?? []);
  }

  if (loading) {
    return (
      <main style={{ padding: "2rem", maxWidth: 1100, margin: "0 auto" }}>
        <p>Loading knowledge bases…</p>
      </main>
    );
  }

  return (
    <main style={{ padding: "2rem", maxWidth: 1100, margin: "0 auto" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ marginBottom: "0.25rem" }}>Knowledge Base</h1>
          <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
            Upload documents for RAG-powered answers in chat. Supports PDF, DOCX, TXT, Markdown,
            CSV, and images (OCR).
          </p>
        </div>
        <Link href="/dashboard" style={{ fontSize: "0.875rem" }}>
          ← Dashboard
        </Link>
      </header>

      {error && (
        <p style={{ color: "var(--danger)", marginBottom: "1rem" }} role="alert">
          {error}
        </p>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "1.5rem" }}>
        <aside
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "1rem",
          }}
        >
          <h2 style={{ fontSize: "0.95rem", marginBottom: "0.75rem" }}>Knowledge Bases</h2>
          <ul style={{ listStyle: "none", display: "grid", gap: "0.5rem" }}>
            {bases.map((base) => (
              <li key={base.id}>
                <button
                  type="button"
                  onClick={() => setSelectedBaseId(base.id)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "0.65rem 0.75rem",
                    borderRadius: 8,
                    border:
                      selectedBaseId === base.id
                        ? "1px solid var(--primary)"
                        : "1px solid var(--border)",
                    background: selectedBaseId === base.id ? "rgba(99,102,241,0.08)" : "transparent",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{base.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                    {SCOPE_LABELS[base.scope]} · {base.documentCount ?? 0} docs
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section style={{ display: "grid", gap: "1.5rem" }}>
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "1.25rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h2 style={{ fontSize: "1rem" }}>{selectedBase?.name ?? "Select a base"}</h2>
                <p style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                  Org {organizationId.slice(0, 8)}… · Workspace {workspaceId.slice(0, 8)}…
                </p>
              </div>
              <label
                style={{
                  padding: "0.6rem 1rem",
                  background: uploading ? "var(--muted)" : "var(--primary)",
                  color: "white",
                  borderRadius: 8,
                  cursor: uploading ? "not-allowed" : "pointer",
                  fontSize: "0.875rem",
                }}
              >
                {uploading ? "Uploading…" : "Upload file"}
                <input
                  type="file"
                  accept=".pdf,.docx,.txt,.md,.markdown,.csv,.png,.jpg,.jpeg,.webp"
                  style={{ display: "none" }}
                  disabled={uploading || !selectedBaseId}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void handleUpload(file);
                    event.target.value = "";
                  }}
                />
              </label>
            </div>

            {documents.length === 0 ? (
              <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
                No documents yet. Upload PDF, DOCX, TXT, Markdown, CSV, or images to index.
              </p>
            ) : (
              <ul style={{ listStyle: "none", display: "grid", gap: "0.75rem" }}>
                {documents.map((doc) => (
                  <li
                    key={doc.id}
                    style={{
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      padding: "0.85rem 1rem",
                      display: "grid",
                      gap: "0.35rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "1rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <strong>{doc.title ?? doc.filename}</strong>
                        <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                          {doc.filename}
                          {doc.fileSize ? ` · ${Math.round(doc.fileSize / 1024)} KB` : ""}
                          {doc.chunkCount ? ` · ${doc.chunkCount} chunks` : ""}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color: STATUS_COLORS[doc.status] ?? "var(--muted)",
                          textTransform: "uppercase",
                        }}
                      >
                        {doc.status}
                      </span>
                    </div>
                    {doc.error && (
                      <p style={{ fontSize: "0.8rem", color: "var(--danger)" }}>{doc.error}</p>
                    )}
                    <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.8rem" }}>
                      <button type="button" onClick={() => void handleReindex(doc.id)}>
                        Re-index
                      </button>
                      <button type="button" onClick={() => void handleDelete(doc.id)}>
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "1.25rem",
            }}
          >
            <h2 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>Semantic Search</h2>
            <form onSubmit={(e) => void handleSearch(e)} style={{ display: "flex", gap: "0.75rem" }}>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search indexed knowledge…"
                style={{
                  flex: 1,
                  padding: "0.65rem 0.75rem",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "transparent",
                  color: "inherit",
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "0.65rem 1rem",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                Search
              </button>
            </form>

            {searchResults.length > 0 && (
              <ul style={{ listStyle: "none", marginTop: "1rem", display: "grid", gap: "0.75rem" }}>
                {searchResults.map((result) => (
                  <li
                    key={result.citationKey}
                    style={{
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      padding: "0.75rem",
                      fontSize: "0.875rem",
                    }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                      [{result.citationKey}] {result.filename}
                    </div>
                    <p style={{ color: "var(--muted)", margin: 0 }}>{result.excerpt}</p>
                    <div style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>
                      score {result.score.toFixed(4)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
