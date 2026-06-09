type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const WINDOW_MS = 60_000;

export class GmbRateLimitError extends Error {
  constructor(message = "Rate limit exceeded") {
    super(message);
    this.name = "GmbRateLimitError";
  }
}

export function checkGmbRateLimit(scope: string, organizationId: string, limit = 30) {
  const key = `gmb:${scope}:org:${organizationId}`;
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }

  if (bucket.count >= limit) {
    throw new GmbRateLimitError(`Rate limit exceeded for ${scope} (${limit}/min)`);
  }

  bucket.count += 1;
}
