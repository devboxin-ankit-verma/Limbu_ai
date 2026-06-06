import { RateLimitError } from "../errors";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const DEFAULT_LIMIT = 60;
const WINDOW_MS = 60_000;

export function checkRateLimit(key: string, limit = DEFAULT_LIMIT): void {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }

  if (bucket.count >= limit) {
    throw new RateLimitError(`Organization rate limit exceeded (${limit}/min)`);
  }

  bucket.count += 1;
}

export function resetRateLimitsForTests() {
  buckets.clear();
}
