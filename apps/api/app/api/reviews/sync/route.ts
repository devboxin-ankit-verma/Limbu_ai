import { enqueueSyncRun, processIntegrationSyncJobs } from "@limbu/integrations";
import { SyncRunType, prisma, IntegrationStatus } from "@limbu/db";
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
    const connection = await prisma.integrationConnection.findFirst({
      where: {
        workspaceId: result.context.workspaceId,
        organizationId: result.context.organizationId,
        status: IntegrationStatus.active,
      },
    });

    if (!connection) {
      return NextResponse.json({ error: "No active integration" }, { status: 400 });
    }

    const syncRun = await enqueueSyncRun(connection.id, result.context, SyncRunType.reviews);
    await processIntegrationSyncJobs(1);
    return NextResponse.json({ syncRun: { id: syncRun.id, status: syncRun.status } });
  } catch (err) {
    return gmbErrorResponse(err);
  }
}
