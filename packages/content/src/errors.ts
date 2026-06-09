export class ContentError extends Error {
  constructor(
    message: string,
    public code: string,
    public status = 400,
  ) {
    super(message);
    this.name = "ContentError";
  }
}

export class PostNotFoundError extends ContentError {
  constructor() {
    super("Post not found", "NOT_FOUND", 404);
  }
}

export class ContentForbiddenError extends ContentError {
  constructor() {
    super("Forbidden", "FORBIDDEN", 403);
  }
}
