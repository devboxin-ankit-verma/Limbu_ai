import type { KnowledgeBaseScope, KnowledgeDocumentStatus } from "@limbu/db";

export type SupportedMimeType =
  | "application/pdf"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  | "text/plain"
  | "text/markdown"
  | "text/csv"
  | "application/csv"
  | "image/png"
  | "image/jpeg"
  | "image/webp";

export interface RagAccessContext {
  userId: string;
  organizationId: string;
  workspaceId?: string;
  isSuperAdmin?: boolean;
}

export interface KnowledgeBaseRecord {
  id: string;
  organizationId: string;
  workspaceId: string | null;
  userId: string | null;
  scope: KnowledgeBaseScope;
  name: string;
  description: string | null;
  isDefault: boolean;
  documentCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface KnowledgeDocumentRecord {
  id: string;
  knowledgeBaseId: string;
  organizationId: string;
  workspaceId: string | null;
  uploadedById: string;
  filename: string;
  title: string | null;
  mimeType: string | null;
  fileSize: number | null;
  status: KnowledgeDocumentStatus;
  chunkCount: number;
  error: string | null;
  processedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ParsedDocument {
  text: string;
  pages?: Array<{ pageNumber: number; text: string }>;
  metadata?: Record<string, unknown>;
}

export interface TextChunk {
  content: string;
  chunkIndex: number;
  pageNumber?: number;
  metadata?: Record<string, unknown>;
}

export interface RagCitation {
  citationKey: string;
  chunkId: string;
  documentId: string;
  knowledgeBaseId: string;
  filename: string;
  title: string | null;
  chunkIndex: number;
  pageNumber: number | null;
  excerpt: string;
  score: number;
}

export interface RetrievalRequest {
  query: string;
  organizationId: string;
  workspaceId?: string;
  userId: string;
  knowledgeBaseIds?: string[];
  scopes?: KnowledgeBaseScope[];
  topK?: number;
  hybrid?: boolean;
}

export interface RetrievalResult {
  citations: RagCitation[];
  contextBlock: string;
  totalTokensEstimate: number;
}

export interface QdrantChunkPayload {
  chunkId: string;
  documentId: string;
  knowledgeBaseId: string;
  organizationId: string;
  workspaceId: string | null;
  userId: string | null;
  scope: KnowledgeBaseScope;
  filename: string;
  title: string | null;
  chunkIndex: number;
  pageNumber: number | null;
  citationKey: string;
  content: string;
}
