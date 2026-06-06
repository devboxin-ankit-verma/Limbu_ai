export class WorkspaceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number = 400,
  ) {
    super(message);
    this.name = "WorkspaceError";
  }
}

export class WorkspaceNotFoundError extends WorkspaceError {
  constructor(message = "Workspace not found") {
    super(message, "WORKSPACE_NOT_FOUND", 404);
  }
}

export class WorkspaceForbiddenError extends WorkspaceError {
  constructor(message = "You do not have permission to perform this action") {
    super(message, "WORKSPACE_FORBIDDEN", 403);
  }
}

export class WorkspaceValidationError extends WorkspaceError {
  constructor(
    message: string,
    public readonly fieldErrors?: Record<string, string[]>,
  ) {
    super(message, "WORKSPACE_VALIDATION", 400);
  }
}

export function isWorkspaceError(err: unknown): err is WorkspaceError {
  return err instanceof WorkspaceError;
}
