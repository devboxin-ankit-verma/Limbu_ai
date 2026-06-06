import { notificationErrorResponse, requireNotificationApi } from "@limbu/shared/api";
import { getVapidPublicKey, pushSubscribeSchema, subscribePush } from "@limbu/notifications";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireNotificationApi();
  if ("error" in auth) return auth.error;
  return NextResponse.json({ publicKey: getVapidPublicKey() });
}

export async function POST(request: Request) {
  const auth = await requireNotificationApi();
  if ("error" in auth) return auth.error;

  try {
    const body = await request.json();
    const parsed = pushSubscribeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
    }
    const subscription = await subscribePush({
      userId: auth.userId,
      endpoint: parsed.data.endpoint,
      p256dh: parsed.data.keys.p256dh,
      auth: parsed.data.keys.auth,
      userAgent: parsed.data.userAgent,
    });
    return NextResponse.json({ subscription });
  } catch (err) {
    return notificationErrorResponse(err);
  }
}

export async function DELETE(request: Request) {
  const auth = await requireNotificationApi();
  if ("error" in auth) return auth.error;

  try {
    const body = await request.json();
    const endpoint = body.endpoint as string;
    if (!endpoint) return NextResponse.json({ error: "endpoint required" }, { status: 400 });
    const { unsubscribePush } = await import("@limbu/notifications");
    const result = await unsubscribePush(auth.userId, endpoint);
    return NextResponse.json(result);
  } catch (err) {
    return notificationErrorResponse(err);
  }
}
