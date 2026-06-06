import { notificationErrorResponse, requireNotificationApi } from "@limbu/shared/api";
import { getUnreadCount } from "@limbu/notifications";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireNotificationApi();
  if ("error" in auth) return auth.error;

  try {
    const count = await getUnreadCount(auth.userId);
    return NextResponse.json({ count });
  } catch (err) {
    return notificationErrorResponse(err);
  }
}
