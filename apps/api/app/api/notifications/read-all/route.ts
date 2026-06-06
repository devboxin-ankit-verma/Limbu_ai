import { notificationErrorResponse, requireNotificationApi } from "@limbu/shared/api";
import { markAllNotificationsRead } from "@limbu/notifications";
import { NextResponse } from "next/server";

export async function POST() {
  const auth = await requireNotificationApi();
  if ("error" in auth) return auth.error;

  try {
    const result = await markAllNotificationsRead(auth.userId);
    return NextResponse.json(result);
  } catch (err) {
    return notificationErrorResponse(err);
  }
}
