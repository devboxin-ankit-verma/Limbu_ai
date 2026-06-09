import { startGoogleConnect, writeIntegrationAudit } from "@limbu/integrations";
import { gmbErrorResponse } from "@limbu/shared/api/gmb-errors";
import { missingWorkspaceResponse } from "@limbu/shared/api";
import { requireWorkspaceSession } from "@limbu/shared/session";
import { NextResponse } from "next/server";

export async function POST() {
  const result = await requireWorkspaceSession();
  if (result.error === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (result.error === "NO_WORKSPACE") return missingWorkspaceResponse();

  try {
    const { checkGmbRateLimit } = await import("@limbu/shared/api/rate-limit");
    checkGmbRateLimit("oauth_connect", result.context.organizationId, 10);

    const connectResult = await startGoogleConnect(result.context);
    await writeIntegrationAudit({
      organizationId: result.context.organizationId,
      actorId: result.context.userId,
      action: connectResult.mock ? "integration.google.mock_connected" : "integration.google.connect_started",
      resourceId: connectResult.connectionId ?? undefined,
    });

    if (connectResult.mock) {
      return NextResponse.json({
        url: `/integrations?connected=mock`,
        mock: true,
        connectionId: connectResult.connectionId,
      });
    }

    return NextResponse.json({ url: connectResult.url, mock: false });
  } catch (err) {
    return gmbErrorResponse(err);
  }
}
