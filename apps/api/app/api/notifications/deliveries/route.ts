import { notificationErrorResponse, requireNotificationApi } from "@limbu/shared/api";
import { listDeliveries } from "@limbu/notifications";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = await requireNotificationApi();
  if ("error" in auth) return auth.error;

  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page") ?? "1");
  const limit = Number(url.searchParams.get("limit") ?? "20");

  try {
    const result = await listDeliveries({ userId: auth.userId, page, limit });
    return NextResponse.json(result);
  } catch (err) {
    return notificationErrorResponse(err);
  }
}
