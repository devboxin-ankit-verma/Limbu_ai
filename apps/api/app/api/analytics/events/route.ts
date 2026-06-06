import { analyticsErrorResponse } from "@limbu/shared/api";
import { auth } from "@/auth";
import { trackProductEvent, trackEventSchema } from "@limbu/analytics";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = trackEventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    await trackProductEvent({
      eventName: parsed.data.eventName,
      userId: session.user.id,
      organizationId: parsed.data.organizationId ?? session.user.organizationId ?? undefined,
      workspaceId: parsed.data.workspaceId ?? session.user.workspaceId ?? undefined,
      properties: parsed.data.properties,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return analyticsErrorResponse(err);
  }
}
