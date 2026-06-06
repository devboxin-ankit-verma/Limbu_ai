import { notificationErrorResponse } from "@limbu/shared/api";
import { verifyWorkerSecret } from "@limbu/notifications";
import { processPendingNotificationJobs } from "@limbu/worker";
import { NextResponse } from "next/server";
export async function POST(request: Request) {
  if (!verifyWorkerSecret(request.headers.get("x-notification-worker-secret"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const result = await processPendingNotificationJobs(body.limit);
    return NextResponse.json(result);
  } catch (err) {
    return notificationErrorResponse(err);
  }
}
