export class ChatError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number = 400,
  ) {
    super(message);
    this.name = "ChatError";
  }
}

export class ChatNotFoundError extends ChatError {
  constructor(message = "Conversation not found") {
    super(message, "CHAT_NOT_FOUND", 404);
  }
}

export class ChatForbiddenError extends ChatError {
  constructor(message = "You do not have permission to access this conversation") {
    super(message, "CHAT_FORBIDDEN", 403);
  }
}

export class ChatValidationError extends ChatError {
  constructor(
    message: string,
    public readonly fieldErrors?: Record<string, string[]>,
  ) {
    super(message, "CHAT_VALIDATION", 400);
  }
}

export function isChatError(err: unknown): err is ChatError {
  return err instanceof ChatError;
}
