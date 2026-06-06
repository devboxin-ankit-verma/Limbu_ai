export class NotificationError extends Error {
  constructor(
    message: string,
    public code: string,
    public status = 400,
  ) {
    super(message);
    this.name = "NotificationError";
  }
}

export class NotificationForbiddenError extends NotificationError {
  constructor(message = "Forbidden") {
    super(message, "FORBIDDEN", 403);
  }
}

export class NotificationNotFoundError extends NotificationError {
  constructor(message = "Not found") {
    super(message, "NOT_FOUND", 404);
  }
}

export function isNotificationError(err: unknown): err is NotificationError {
  return err instanceof NotificationError;
}
