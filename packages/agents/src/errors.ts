export class AgentError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number = 500,
  ) {
    super(message);
    this.name = "AgentError";
  }
}

export class AgentNotFoundError extends AgentError {
  constructor(key: string) {
    super(`Agent '${key}' is not registered`, "AGENT_NOT_FOUND", 404);
  }
}

export class AgentForbiddenError extends AgentError {
  constructor(message = "Forbidden") {
    super(message, "FORBIDDEN", 403);
  }
}

export class AgentValidationError extends AgentError {
  constructor(message: string, public readonly fields?: Record<string, string[]>) {
    super(message, "VALIDATION_ERROR", 400);
  }
}

export function isAgentError(err: unknown): err is AgentError {
  return err instanceof AgentError;
}
