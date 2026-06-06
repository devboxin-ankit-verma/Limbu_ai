import { AiCoreError, isAiCoreError } from "../errors";
import type { ProviderStreamRequest } from "../types";
import { streamWithProvider } from "../providers";

export type ProviderStreamEvent =
  | { type: "delta"; content: string }
  | { type: "usage"; promptTokens: number; completionTokens: number };

export async function* streamProviderWithRetry(
  request: ProviderStreamRequest,
  options?: { maxAttempts?: number; baseDelayMs?: number },
): AsyncGenerator<ProviderStreamEvent> {
  const maxAttempts = options?.maxAttempts ?? 3;
  const baseDelayMs = options?.baseDelayMs ?? 500;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      for await (const event of streamWithProvider(request)) {
        yield event;
      }
      return;
    } catch (err) {
      lastError = err;
      const retryable = err instanceof AiCoreError ? err.retryable : isRetryableError(err);
      if (!retryable || attempt === maxAttempts) break;
      await sleep(baseDelayMs * 2 ** (attempt - 1));
    }
  }

  throw lastError;
}

export function shouldFallbackProvider(err: unknown, streamedBytes: number): boolean {
  if (streamedBytes > 0) return false;
  if (isAiCoreError(err) && err.code === "CONTEXT_WINDOW_EXCEEDED") return false;
  return true;
}

function isRetryableError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  return msg.includes("timeout") || msg.includes("rate") || msg.includes("503") || msg.includes("429");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
