import { NextResponse } from "next/server";

export function gmbErrorResponse(err: unknown) {
  if (err && typeof err === "object" && "name" in err && err.name === "GmbRateLimitError") {
    return NextResponse.json(
      { error: (err as Error).message, code: "RATE_LIMIT" },
      { status: 429 },
    );
  }
  if (err && typeof err === "object" && "status" in err && "message" in err) {
    const e = err as { status?: number; message: string; code?: string };
    return NextResponse.json(
      { error: e.message, code: e.code },
      { status: e.status ?? 400 },
    );
  }
  console.error("[gmb-api]", err);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
