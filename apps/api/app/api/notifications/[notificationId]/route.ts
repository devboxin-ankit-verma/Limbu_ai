import { notificationErrorResponse, requireNotificationApi } from "@limbu/shared/api";
import { markNotificationRead } from "@limbu/notifications";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ notificationId: string }> };

export async function PATCH(_request: Request, { params }: Params) {
  const auth = await requireNotificationApi();
  if ("error" in auth) return auth.error;

  try {
    const { notificationId } = await params;
    const notification = await markNotificationRead(notificationId, auth.userId);
    return NextResponse.json({ notification });
  } catch (err) {
    return notificationErrorResponse(err);
  }
}
