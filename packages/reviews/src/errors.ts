export class ReviewError extends Error {
  constructor(
    message: string,
    public code: string,
    public status = 400,
  ) {
    super(message);
    this.name = "ReviewError";
  }
}

export class ReviewNotFoundError extends ReviewError {
  constructor() {
    super("Review not found", "NOT_FOUND", 404);
  }
}
