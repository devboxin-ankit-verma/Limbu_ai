import { NextResponse } from "next/server";

export type DomainErrorLike = {
  message: string;
  code: string;
  status: number;
  fields?: Record<string, string[]>;
  fieldErrors?: Record<string, string[]>;
  quotaType?: string;
};

export function createDomainErrorResponse(
  isError: (err: unknown) => err is DomainErrorLike,
  includeInternalCode = false,
) {
  return function domainErrorResponse(err: unknown) {
    if (isError(err)) {
      const body: Record<string, unknown> = {
        error: err.message,
        code: err.code,
      };
      if (err.fields) body.fields = err.fields;
      if (err.fieldErrors) body.fieldErrors = err.fieldErrors;
      if (err.quotaType) body.quotaType = err.quotaType;
      return NextResponse.json(body, { status: err.status });
    }
    console.error(err);
    const internal: Record<string, unknown> = { error: "Internal server error" };
    if (includeInternalCode) internal.code = "INTERNAL";
    return NextResponse.json(internal, { status: 500 });
  };
}

export function missingWorkspaceResponse(
  message = "No workspace selected",
  code = "NO_WORKSPACE",
) {
  return NextResponse.json({ error: message, code }, { status: 400 });
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbiddenResponse(code = "FORBIDDEN") {
  return NextResponse.json({ error: "Forbidden", code }, { status: 403 });
}
