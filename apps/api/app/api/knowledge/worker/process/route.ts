import { ragErrorResponse } from "@limbu/shared/api";
import { verifyWorkerSecret } from "@limbu/rag";
import { processPendingIngestJobs } from "@limbu/worker";
import { NextResponse } from "next/server";
export async function POST(request: Request) {
  if (!verifyWorkerSecret(request.headers.get("x-rag-worker-secret"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const limit = typeof body.limit === "number" ? body.limit : undefined;
    const results = await processPendingIngestJobs(limit);
    return NextResponse.json({ processed: results.length, results });
  } catch (err) {
    return ragErrorResponse(err);
  }
}
