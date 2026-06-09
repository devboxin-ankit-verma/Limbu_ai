import { enqueueSyncRun, processIntegrationSyncJobs } from "@limbu/integrations";
import { SyncRunType } from "@limbu/db";
import { gmbErrorResponse } from "@limbu/shared/api/gmb-errors";
import { missingWorkspaceResponse } from "@limbu/shared/api";
import { requireWorkspaceSession } from "@limbu/shared/session";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ connectionId: string }> };

export async function POST(request: Request, { params }: Params) {
  const result = await requireWorkspaceSession();
  if (result.error === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (result.error === "NO_WORKSPACE") return missingWorkspaceResponse();

  try {
    const { connectionId } = await params;
    const body = await request.json().catch(() => ({}));
    const type = (body.type as SyncRunType) ?? SyncRunType.reviews;
    const syncRun = await enqueueSyncRun(connectionId, result.context, type);
    await processIntegrationSyncJobs(1);
    return NextResponse.json({ syncRun: { id: syncRun.id, status: syncRun.status } });
  } catch (err) {
    return gmbErrorResponse(err);
  }
}
