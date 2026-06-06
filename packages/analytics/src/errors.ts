export class AnalyticsError extends Error {
  constructor(
    message: string,
    public code: string,
    public status = 400,
  ) {
    super(message);
    this.name = "AnalyticsError";
  }
}

export class AnalyticsForbiddenError extends AnalyticsError {
  constructor(message = "Forbidden") {
    super(message, "FORBIDDEN", 403);
  }
}

export function isAnalyticsError(err: unknown): err is AnalyticsError {
  return err instanceof AnalyticsError;
}
