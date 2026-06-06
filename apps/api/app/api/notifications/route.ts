import { notificationErrorResponse, requireNotificationApi } from "@limbu/shared/api";
import { listNotifications, paginationSchema } from "@limbu/notifications";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = await requireNotificationApi();
  if ("error" in auth) return auth.error;

  const url = new URL(request.url);
  const parsed = paginationSchema.safeParse({
    page: url.searchParams.get("page"),
    limit: url.searchParams.get("limit"),
    unreadOnly: url.searchParams.get("unreadOnly") ?? undefined,
  });

  try {
    const result = await listNotifications({
      userId: auth.userId,
      ...(parsed.success ? parsed.data : {}),
    });
    return NextResponse.json(result);
  } catch (err) {
    return notificationErrorResponse(err);
  }
}
