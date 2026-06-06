import { notificationErrorResponse, requireNotificationApi } from "@limbu/shared/api";
import {
  getUserPreferences,
  updateUserPreference,
  updatePreferenceSchema,
} from "@limbu/notifications";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireNotificationApi();
  if ("error" in auth) return auth.error;

  try {
    const preferences = await getUserPreferences(auth.userId);
    return NextResponse.json({ preferences });
  } catch (err) {
    return notificationErrorResponse(err);
  }
}

export async function PATCH(request: Request) {
  const auth = await requireNotificationApi();
  if ("error" in auth) return auth.error;

  try {
    const body = await request.json();
    const parsed = updatePreferenceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const preference = await updateUserPreference(auth.userId, parsed.data);
    return NextResponse.json({ preference });
  } catch (err) {
    return notificationErrorResponse(err);
  }
}
