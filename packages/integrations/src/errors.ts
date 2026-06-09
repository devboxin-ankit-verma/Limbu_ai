export class IntegrationError extends Error {
  constructor(
    message: string,
    public code: string,
    public status = 400,
  ) {
    super(message);
    this.name = "IntegrationError";
  }
}

export class IntegrationNotFoundError extends IntegrationError {
  constructor() {
    super("Integration connection not found", "NOT_FOUND", 404);
  }
}

export class IntegrationForbiddenError extends IntegrationError {
  constructor() {
    super("Forbidden", "FORBIDDEN", 403);
  }
}
