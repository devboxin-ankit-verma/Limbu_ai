export class AdminError extends Error {
  constructor(
    message: string,
    public code: string,
    public status = 400,
  ) {
    super(message);
    this.name = "AdminError";
  }
}

export class AdminForbiddenError extends AdminError {
  constructor(message = "Forbidden") {
    super(message, "FORBIDDEN", 403);
  }
}

export class AdminNotFoundError extends AdminError {
  constructor(message = "Not found") {
    super(message, "NOT_FOUND", 404);
  }
}

export function isAdminError(err: unknown): err is AdminError {
  return err instanceof AdminError;
}
