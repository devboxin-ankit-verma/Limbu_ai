import type { ProviderName } from "./types";

export class AiCoreError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number = 500,
    public readonly retryable = false,
  ) {
    super(message);
    this.name = "AiCoreError";
  }
}

export class ProviderNotConfiguredError extends AiCoreError {
  constructor(provider: ProviderName) {
    super(
      `${provider} is not configured. Set the provider API key in environment variables.`,
      "PROVIDER_NOT_CONFIGURED",
      503,
      false,
    );
  }
}

export class RateLimitError extends AiCoreError {
  constructor(message = "Rate limit exceeded") {
    super(message, "RATE_LIMITED", 429, true);
  }
}

export class ContextWindowError extends AiCoreError {
  constructor(message = "Conversation exceeds context window") {
    super(message, "CONTEXT_WINDOW_EXCEEDED", 400, false);
  }
}

export class ToolPermissionError extends AiCoreError {
  constructor(toolName: string) {
    super(`Tool '${toolName}' is not permitted in this workspace`, "TOOL_FORBIDDEN", 403);
  }
}

export class ToolNotFoundError extends AiCoreError {
  constructor(toolName: string) {
    super(`Tool '${toolName}' is not registered`, "TOOL_NOT_FOUND", 404);
  }
}

export function isAiCoreError(err: unknown): err is AiCoreError {
  return err instanceof AiCoreError;
}
