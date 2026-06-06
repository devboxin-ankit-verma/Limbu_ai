export class LimbuError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number = 500,
  ) {
    super(message);
    this.name = "LimbuError";
  }
}

export class ForbiddenError extends LimbuError {
  constructor(message = "Forbidden", code = "FORBIDDEN") {
    super(message, code, 403);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends LimbuError {
  constructor(message = "Not found", code = "NOT_FOUND") {
    super(message, code, 404);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends LimbuError {
  constructor(
    message: string,
    public readonly fields?: Record<string, string[]>,
    code = "VALIDATION_ERROR",
  ) {
    super(message, code, 400);
    this.name = "ValidationError";
  }
}

export function isLimbuError(err: unknown): err is LimbuError {
  return err instanceof LimbuError;
}
