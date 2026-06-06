import { workflowErrorResponse } from "@limbu/shared/api";
import { runSchedulerTick, verifyWorkerSecret } from "@limbu/workflows";
import { processPendingJobs } from "@limbu/worker";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  if (!verifyWorkerSecret(request.headers.get("x-workflow-worker-secret"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    if (body.schedule === true) {
      const scheduleResult = await runSchedulerTick();
      const processed = await processPendingJobs(body.limit);
      return NextResponse.json({ ...scheduleResult, processed });
    }
    const processed = await processPendingJobs(body.limit);
    return NextResponse.json({ processed });
  } catch (err) {
    return workflowErrorResponse(err);
  }
}
