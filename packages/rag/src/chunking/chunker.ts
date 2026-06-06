import { RAG_CONFIG } from "../config";
import type { ParsedDocument, TextChunk } from "../types";

export function chunkDocument(parsed: ParsedDocument): TextChunk[] {
  if (parsed.pages?.length) {
    const chunks: TextChunk[] = [];
    let index = 0;
    for (const page of parsed.pages) {
      const pageChunks = splitText(page.text).map((content) => ({
        content,
        chunkIndex: index++,
        pageNumber: page.pageNumber,
      }));
      chunks.push(...pageChunks);
    }
    return chunks;
  }

  return splitText(parsed.text).map((content, chunkIndex) => ({ content, chunkIndex }));
}

function splitText(text: string): string[] {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const chunks: string[] = [];
  const size = RAG_CONFIG.chunkSize;
  const overlap = RAG_CONFIG.chunkOverlap;
  let start = 0;

  while (start < normalized.length) {
    let end = Math.min(start + size, normalized.length);

    if (end < normalized.length) {
      const paragraphBreak = normalized.lastIndexOf("\n\n", end);
      const sentenceBreak = normalized.lastIndexOf(". ", end);
      const breakAt = Math.max(paragraphBreak, sentenceBreak);
      if (breakAt > start + size * 0.5) end = breakAt + 1;
    }

    const slice = normalized.slice(start, end).trim();
    if (slice) chunks.push(slice);
    if (end >= normalized.length) break;
    start = Math.max(end - overlap, start + 1);
  }

  return chunks;
}

export function estimateChunkTokens(text: string) {
  return Math.ceil(text.length / 4);
}
