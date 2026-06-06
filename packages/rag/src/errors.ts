export class RagError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number = 500,
  ) {
    super(message);
    this.name = "RagError";
  }
}

export class RagNotFoundError extends RagError {
  constructor(message = "Resource not found") {
    super(message, "NOT_FOUND", 404);
  }
}

export class RagForbiddenError extends RagError {
  constructor(message = "Forbidden") {
    super(message, "FORBIDDEN", 403);
  }
}

export class RagValidationError extends RagError {
  constructor(message: string, public readonly fields?: Record<string, string[]>) {
    super(message, "VALIDATION_ERROR", 400);
  }
}

export class RagProcessingError extends RagError {
  constructor(message: string) {
    super(message, "PROCESSING_ERROR", 422);
  }
}

export class RagConfigError extends RagError {
  constructor(message: string) {
    super(message, "CONFIG_ERROR", 503);
  }
}

export function isRagError(err: unknown): err is RagError {
  return err instanceof RagError;
}
