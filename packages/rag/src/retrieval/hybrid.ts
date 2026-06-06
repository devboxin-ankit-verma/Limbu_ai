import type { RagCitation } from "../types";

export function reciprocalRankFusion(
  lists: RagCitation[][],
  k = 60,
): RagCitation[] {
  const scores = new Map<string, { citation: RagCitation; score: number }>();

  for (const list of lists) {
    list.forEach((citation, rank) => {
      const existing = scores.get(citation.chunkId);
      const rrf = 1 / (k + rank + 1);
      if (existing) {
        existing.score += rrf;
      } else {
        scores.set(citation.chunkId, { citation: { ...citation, score: rrf }, score: rrf });
      }
    });
  }

  return [...scores.values()]
    .sort((a, b) => b.score - a.score)
    .map(({ citation, score }) => ({ ...citation, score }));
}
