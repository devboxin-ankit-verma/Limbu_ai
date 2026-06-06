import { Prisma, prisma } from "@limbu/db";
import type { RagCitation } from "../types";

export async function keywordSearch(input: {
  query: string;
  organizationId: string;
  workspaceId?: string;
  userId: string;
  knowledgeBaseIds?: string[];
  topK: number;
}): Promise<RagCitation[]> {
  const terms = input.query
    .split(/\s+/)
    .map((t) => t.replace(/[^\w-]/g, ""))
    .filter(Boolean)
    .slice(0, 8)
    .join(" & ");

  if (!terms) return [];

  const kbClause = input.knowledgeBaseIds?.length
    ? Prisma.sql`AND kd.knowledge_base_id = ANY(${input.knowledgeBaseIds}::uuid[])`
    : Prisma.empty;

  const rows = await prisma.$queryRaw<
    Array<{
      id: string;
      document_id: string;
      knowledge_base_id: string;
      chunk_index: number;
      page_number: number | null;
      citation_key: string | null;
      content: string;
      filename: string;
      title: string | null;
      rank: number;
    }>
  >`
    SELECT
      dc.id,
      dc.document_id,
      kd.knowledge_base_id,
      dc.chunk_index,
      dc.page_number,
      dc.citation_key,
      dc.content,
      kd.filename,
      kd.title,
      ts_rank(to_tsvector('english', dc.content), to_tsquery('english', ${terms})) AS rank
    FROM document_chunks dc
    JOIN knowledge_documents kd ON kd.id = dc.document_id
    JOIN knowledge_bases kb ON kb.id = kd.knowledge_base_id
    WHERE dc.organization_id = ${input.organizationId}::uuid
      AND kd.status = 'ready'
      AND to_tsvector('english', dc.content) @@ to_tsquery('english', ${terms})
      AND (
        (kb.scope = 'workspace' AND kb.workspace_id = ${input.workspaceId ?? null}::uuid)
        OR kb.scope = 'organization'
        OR (kb.scope = 'personal' AND kb.user_id = ${input.userId}::uuid)
      )
      ${kbClause}
    ORDER BY rank DESC
    LIMIT ${input.topK}
  `;

  return rows.map((row, index) => ({
    citationKey: row.citation_key ?? `${row.document_id}:${row.chunk_index}`,
    chunkId: row.id,
    documentId: row.document_id,
    knowledgeBaseId: row.knowledge_base_id,
    filename: row.filename,
    title: row.title,
    chunkIndex: row.chunk_index,
    pageNumber: row.page_number,
    excerpt: row.content.slice(0, 400),
    score: Number(row.rank) || 1 / (index + 1),
  }));
}
