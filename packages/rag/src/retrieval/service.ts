import { embedQuery } from "../embedding/service";
import { RAG_CONFIG } from "../config";
import { keywordSearch } from "./keyword";
import { reciprocalRankFusion } from "./hybrid";
import { buildContextBlock, estimateContextTokens, trimCitationsToBudget } from "./context";
import { semanticSearch } from "../vector/qdrant";
import type { RagCitation, RetrievalRequest, RetrievalResult } from "../types";

export async function retrieveKnowledgeContext(
  request: RetrievalRequest,
  options?: { maxContextTokens?: number },
): Promise<RetrievalResult> {
  const topK = request.topK ?? RAG_CONFIG.defaultTopK;
  const maxContextTokens =
    options?.maxContextTokens ??
    Math.floor(128_000 * RAG_CONFIG.maxContextRatio);

  let citations: RagCitation[] = [];

  if (request.hybrid !== false) {
    const [semantic, keyword] = await Promise.all([
      semanticRetrieve(request, topK).catch(() => [] as RagCitation[]),
      keywordSearch({
        query: request.query,
        organizationId: request.organizationId,
        workspaceId: request.workspaceId,
        userId: request.userId,
        knowledgeBaseIds: request.knowledgeBaseIds,
        topK,
      }).catch(() => [] as RagCitation[]),
    ]);
    citations = reciprocalRankFusion([semantic, keyword]).slice(0, topK);
  } else {
    citations = (await semanticRetrieve(request, topK)).slice(0, topK);
  }

  citations = trimCitationsToBudget(citations, maxContextTokens);
  const contextBlock = buildContextBlock(citations);

  return {
    citations,
    contextBlock,
    totalTokensEstimate: estimateContextTokens(contextBlock),
  };
}

async function semanticRetrieve(request: RetrievalRequest, topK: number): Promise<RagCitation[]> {
  const vector = await embedQuery(request.query);
  const hits = await semanticSearch({
    vector,
    organizationId: request.organizationId,
    workspaceId: request.workspaceId,
    userId: request.userId,
    knowledgeBaseIds: request.knowledgeBaseIds,
    scopes: request.scopes,
    topK,
  });

  return hits.map((hit) => {
    const payload = hit.payload;
    return {
      citationKey: String(payload.citation_key ?? payload.chunk_id),
      chunkId: String(payload.chunk_id),
      documentId: String(payload.document_id),
      knowledgeBaseId: String(payload.knowledge_base_id),
      filename: String(payload.filename ?? "document"),
      title: payload.title ? String(payload.title) : null,
      chunkIndex: Number(payload.chunk_index ?? 0),
      pageNumber: payload.page_number != null ? Number(payload.page_number) : null,
      excerpt: String(payload.content ?? "").slice(0, 400),
      score: hit.score,
    };
  });
}

export function formatSourceReferences(citations: RagCitation[]): string {
  if (citations.length === 0) return "";
  return [
    "### Sources",
    ...citations.map((c, i) => {
      const label = c.title ?? c.filename;
      const page = c.pageNumber ? ` (p. ${c.pageNumber})` : "";
      return `${i + 1}. ${label}${page} — ${c.citationKey}`;
    }),
  ].join("\n");
}
