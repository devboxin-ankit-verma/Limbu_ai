import { disconnectConnection, writeIntegrationAudit } from "@limbu/integrations";
import { gmbErrorResponse } from "@limbu/shared/api/gmb-errors";
import { missingWorkspaceResponse } from "@limbu/shared/api";
import { requireWorkspaceSession } from "@limbu/shared/session";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ connectionId: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  const result = await requireWorkspaceSession();
  if (result.error === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (result.error === "NO_WORKSPACE") return missingWorkspaceResponse();

  try {
    const { connectionId } = await params;
    await disconnectConnection(connectionId, result.context);
    await writeIntegrationAudit({
      organizationId: result.context.organizationId,
      actorId: result.context.userId,
      action: "integration.disconnected",
      resourceId: connectionId,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return gmbErrorResponse(err);
  }
}
