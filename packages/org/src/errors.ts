export class OrgError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number = 400,
  ) {
    super(message);
    this.name = "OrgError";
  }
}

export class OrgNotFoundError extends OrgError {
  constructor(message = "Organization not found") {
    super(message, "ORG_NOT_FOUND", 404);
  }
}

export class OrgForbiddenError extends OrgError {
  constructor(message = "You do not have permission to perform this action") {
    super(message, "ORG_FORBIDDEN", 403);
  }
}

export class OrgValidationError extends OrgError {
  constructor(
    message: string,
    public readonly fieldErrors?: Record<string, string[]>,
  ) {
    super(message, "ORG_VALIDATION", 400);
  }
}

export function isOrgError(err: unknown): err is OrgError {
  return err instanceof OrgError;
}
