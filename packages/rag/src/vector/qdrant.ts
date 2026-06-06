import { QdrantClient } from "@qdrant/js-client-rest";
import { RagConfigError } from "../errors";
import { RAG_CONFIG } from "../config";
import type { QdrantChunkPayload } from "../types";

let client: QdrantClient | null = null;
let collectionReady = false;

function getClient() {
  if (!client) {
    client = new QdrantClient({
      url: RAG_CONFIG.qdrantUrl,
      apiKey: RAG_CONFIG.qdrantApiKey,
    });
  }
  return client;
}

export async function ensureCollection() {
  if (collectionReady) return;
  const qdrant = getClient();
  const collections = await qdrant.getCollections();
  const exists = collections.collections.some((c) => c.name === RAG_CONFIG.collectionName);

  if (!exists) {
    await qdrant.createCollection(RAG_CONFIG.collectionName, {
      vectors: {
        size: RAG_CONFIG.embeddingDimensions,
        distance: "Cosine",
      },
    });

    for (const field of ["organization_id", "workspace_id", "user_id", "knowledge_base_id", "scope"]) {
      await qdrant.createPayloadIndex(RAG_CONFIG.collectionName, {
        field_name: field,
        field_schema: "keyword",
      });
    }
  }

  collectionReady = true;
}

export async function upsertChunkVectors(
  points: Array<{ id: string; vector: number[]; payload: QdrantChunkPayload }>,
) {
  if (points.length === 0) return;
  await ensureCollection();
  const qdrant = getClient();
  await qdrant.upsert(RAG_CONFIG.collectionName, {
    wait: true,
    points: points.map((point) => ({
      id: point.id,
      vector: point.vector,
      payload: {
        chunk_id: point.payload.chunkId,
        document_id: point.payload.documentId,
        knowledge_base_id: point.payload.knowledgeBaseId,
        organization_id: point.payload.organizationId,
        workspace_id: point.payload.workspaceId,
        user_id: point.payload.userId,
        scope: point.payload.scope,
        filename: point.payload.filename,
        title: point.payload.title,
        chunk_index: point.payload.chunkIndex,
        page_number: point.payload.pageNumber,
        citation_key: point.payload.citationKey,
        content: point.payload.content,
      },
    })),
  });
}

export async function deleteDocumentVectors(documentId: string) {
  await ensureCollection();
  const qdrant = getClient();
  await qdrant.delete(RAG_CONFIG.collectionName, {
    wait: true,
    filter: {
      must: [{ key: "document_id", match: { value: documentId } }],
    },
  });
}

export async function deleteChunkVectors(vectorIds: string[]) {
  if (vectorIds.length === 0) return;
  await ensureCollection();
  const qdrant = getClient();
  await qdrant.delete(RAG_CONFIG.collectionName, {
    wait: true,
    points: vectorIds,
  });
}

export async function semanticSearch(input: {
  vector: number[];
  organizationId: string;
  workspaceId?: string;
  userId: string;
  knowledgeBaseIds?: string[];
  scopes?: string[];
  topK: number;
}) {
  await ensureCollection();
  const qdrant = getClient();

  const filter: Record<string, unknown> = {
    must: [{ key: "organization_id", match: { value: input.organizationId } }],
  };

  if (input.knowledgeBaseIds?.length) {
    filter.must = [
      ...(filter.must as unknown[]),
      { key: "knowledge_base_id", match: { any: input.knowledgeBaseIds } },
    ];
  } else {
    filter.should = [
      ...(input.workspaceId
        ? [{ key: "workspace_id", match: { value: input.workspaceId } }]
        : []),
      { key: "scope", match: { value: "organization" } },
      {
        must: [
          { key: "scope", match: { value: "personal" } },
          { key: "user_id", match: { value: input.userId } },
        ],
      },
    ];
    filter.minimum_should = 1;
  }

  if (input.scopes?.length) {
    filter.must = [
      ...((filter.must as unknown[]) ?? []),
      { key: "scope", match: { any: input.scopes } },
    ];
  }

  const results = await qdrant.search(RAG_CONFIG.collectionName, {
    vector: input.vector,
    limit: input.topK,
    with_payload: true,
    filter,
  });

  return results.map((hit) => ({
    score: hit.score ?? 0,
    payload: hit.payload as Record<string, unknown>,
  }));
}

export function isQdrantConfigured() {
  return Boolean(RAG_CONFIG.qdrantUrl);
}

export async function pingQdrant() {
  if (!isQdrantConfigured()) return false;
  try {
    await ensureCollection();
    return true;
  } catch {
    return false;
  }
}
