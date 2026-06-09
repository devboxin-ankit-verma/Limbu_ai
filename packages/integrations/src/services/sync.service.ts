import { prisma, SyncRunStatus } from "@limbu/db";
import { INTEGRATION_CONFIG } from "../config";
import { MOCK_GOOGLE_REVIEWS } from "../mock/google";
import type { IntegrationContext } from "../types";

export async function processIntegrationSyncJobs(batchSize = 5) {
  const runs = await prisma.integrationSyncRun.findMany({
    where: { status: SyncRunStatus.running },
    take: batchSize,
    orderBy: { startedAt: "asc" },
    include: { connection: true },
  });

  let processed = 0;
  for (const run of runs) {
    try {
      let recordsSynced = 0;

      if (
        INTEGRATION_CONFIG.mockGoogle ||
        run.connection.provider === "google_business"
      ) {
        if (run.type === "reviews") {
          recordsSynced = await syncMockReviews(run.workspaceId, run.organizationId);
        }
      }

      await prisma.integrationSyncRun.update({
        where: { id: run.id },
        data: {
          status: SyncRunStatus.success,
          recordsSynced,
          completedAt: new Date(),
        },
      });

      await prisma.integrationConnection.update({
        where: { id: run.connectionId },
        data: { lastSyncAt: new Date() },
      });

      processed++;
    } catch (err) {
      await prisma.integrationSyncRun.update({
        where: { id: run.id },
        data: {
          status: SyncRunStatus.failed,
          error: err instanceof Error ? err.message : "Sync failed",
          completedAt: new Date(),
        },
      });
    }
  }

  return processed;
}

async function syncMockReviews(workspaceId: string, organizationId: string) {
  let count = 0;
  for (const review of MOCK_GOOGLE_REVIEWS) {
    await prisma.review.upsert({
      where: {
        workspaceId_externalId: { workspaceId, externalId: review.externalId },
      },
      create: {
        workspaceId,
        organizationId,
        externalId: review.externalId,
        rating: review.rating,
        text: review.text,
        author: review.author,
      },
      update: {
        rating: review.rating,
        text: review.text,
        author: review.author,
      },
    });
    count++;
  }
  return count;
}

export async function listLocations(ctx: IntegrationContext) {
  const locations = await prisma.connectedLocation.findMany({
    where: {
      connection: {
        workspaceId: ctx.workspaceId,
        organizationId: ctx.organizationId,
      },
    },
    include: { connection: { select: { provider: true, status: true } } },
    orderBy: { name: "asc" },
  });

  return locations.map((l) => ({
    id: l.id,
    name: l.name,
    address: l.address,
    externalLocationId: l.externalLocationId,
    provider: l.connection.provider,
    connectionStatus: l.connection.status,
    metadata: l.metadata as Record<string, unknown>,
  }));
}
