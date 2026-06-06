import type { RagCitation } from "../types";

const INJECTION_PATTERNS = [
  /ignore (all )?(previous|prior) instructions/i,
  /system prompt/i,
  /you are now/i,
  /<\/?system>/i,
  /\[INST\]/i,
];

export function sanitizeChunkContent(content: string): string {
  let sanitized = content.replace(/\0/g, "").trim();
  for (const pattern of INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, "[filtered]");
  }
  return sanitized.slice(0, 4000);
}

export function buildContextBlock(citations: RagCitation[]): string {
  if (citations.length === 0) return "";

  const lines = citations.map((citation, index) => {
    const label = citation.title ?? citation.filename;
    const page = citation.pageNumber ? `, page ${citation.pageNumber}` : "";
    return `[${index + 1}] ${label}${page} (${citation.citationKey})\n${sanitizeChunkContent(citation.excerpt)}`;
  });

  return [
    "## Retrieved Knowledge",
    "Use the following sources when answering. Cite sources inline as [1], [2], etc.",
    "If the sources do not contain the answer, say so — do not invent facts.",
    "",
    ...lines,
  ].join("\n");
}

export function estimateContextTokens(text: string) {
  return Math.ceil(text.length / 4);
}

export function trimCitationsToBudget(citations: RagCitation[], maxTokens: number) {
  const kept: RagCitation[] = [];
  let used = 0;

  for (const citation of citations) {
    const cost = estimateContextTokens(citation.excerpt) + 32;
    if (used + cost > maxTokens) break;
    kept.push(citation);
    used += cost;
  }

  return kept;
}
