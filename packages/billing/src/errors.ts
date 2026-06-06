export class BillingError extends Error {
  constructor(
    message: string,
    public code: string,
    public status = 400,
  ) {
    super(message);
    this.name = "BillingError";
  }
}

export class BillingForbiddenError extends BillingError {
  constructor(message = "Forbidden") {
    super(message, "FORBIDDEN", 403);
  }
}

export class BillingNotFoundError extends BillingError {
  constructor(message = "Not found") {
    super(message, "NOT_FOUND", 404);
  }
}

export class BillingQuotaExceededError extends BillingError {
  constructor(message: string, public quotaType: string) {
    super(message, "QUOTA_EXCEEDED", 402);
  }
}

export function isBillingError(err: unknown): err is BillingError {
  return err instanceof BillingError;
}
