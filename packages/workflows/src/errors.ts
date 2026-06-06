export class WorkflowError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number = 500,
  ) {
    super(message);
    this.name = "WorkflowError";
  }
}

export class WorkflowNotFoundError extends WorkflowError {
  constructor(message = "Workflow not found") {
    super(message, "NOT_FOUND", 404);
  }
}

export class WorkflowForbiddenError extends WorkflowError {
  constructor(message = "Forbidden") {
    super(message, "FORBIDDEN", 403);
  }
}

export class WorkflowValidationError extends WorkflowError {
  constructor(message: string, public readonly fields?: Record<string, string[]>) {
    super(message, "VALIDATION_ERROR", 400);
  }
}

export function isWorkflowError(err: unknown): err is WorkflowError {
  return err instanceof WorkflowError;
}
