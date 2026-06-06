export function parseDateRange(days: number): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date();
  from.setUTCDate(from.getUTCDate() - days);
  from.setUTCHours(0, 0, 0, 0);
  return { from, to };
}

export function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function groupByDate<T extends { createdAt: Date }>(
  rows: T[],
  valueFn: (row: T) => number,
): Map<string, number> {
  const map = new Map<string, number>();
  for (const row of rows) {
    const key = toDateKey(row.createdAt);
    map.set(key, (map.get(key) ?? 0) + valueFn(row));
  }
  return map;
}

export function toTimeSeries(map: Map<string, number>, fillDays?: number): Array<{ date: string; value: number }> {
  if (fillDays) {
    const result: Array<{ date: string; value: number }> = [];
    const now = new Date();
    for (let i = fillDays - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setUTCDate(d.getUTCDate() - i);
      const key = toDateKey(d);
      result.push({ date: key, value: map.get(key) ?? 0 });
    }
    return result;
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value }));
}

export function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)] ?? 0;
}

export function estimateTokensFromCredits(credits: number): number {
  return credits * 1000;
}
