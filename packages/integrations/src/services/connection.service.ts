import { randomBytes } from "node:crypto";
import {
  IntegrationProvider,
  IntegrationStatus,
  prisma,
  SyncRunStatus,
  SyncRunType,
} from "@limbu/db";
import { INTEGRATION_CONFIG } from "../config";
import { encryptCredential } from "../crypto";
import { IntegrationError } from "../errors";
import { assertIntegrationPermission } from "../access";
import type { IntegrationContext } from "../types";
import { MOCK_GOOGLE_LOCATIONS } from "../mock/google";

function toConnectionRecord(connection: {
  id: string;
  provider: string;
  status: string;
  lastSyncAt: Date | null;
  locations: Array<{ id: string; name: string | null; address: string | null }>;
}) {
  return {
    id: connection.id,
    provider: connection.provider,
    status: connection.status,
    lastSyncAt: connection.lastSyncAt?.toISOString() ?? null,
    locations: connection.locations.map((l) => ({
      id: l.id,
      name: l.name,
      address: l.address,
    })),
  };
}

export async function listConnections(ctx: IntegrationContext) {
  await assertIntegrationPermission(ctx);
  const connections = await prisma.integrationConnection.findMany({
    where: { workspaceId: ctx.workspaceId, organizationId: ctx.organizationId },
    include: { locations: true },
    orderBy: { createdAt: "desc" },
  });
  return connections.map(toConnectionRecord);
}

export async function startGoogleConnect(ctx: IntegrationContext) {
  await assertIntegrationPermission(ctx, true);

  if (INTEGRATION_CONFIG.mockGoogle || !INTEGRATION_CONFIG.googleClientId) {
    const connection = await createMockGoogleConnection(ctx);
    return { url: null as string | null, connectionId: connection.id, mock: true };
  }

  const stateToken = randomBytes(32).toString("hex");
  await prisma.oAuthState.create({
    data: {
      userId: ctx.userId,
      stateToken,
      provider: IntegrationProvider.google_business,
      redirectUri: INTEGRATION_CONFIG.googleRedirectUri,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  const params = new URLSearchParams({
    client_id: INTEGRATION_CONFIG.googleClientId,
    redirect_uri: INTEGRATION_CONFIG.googleRedirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/business.manage",
    access_type: "offline",
    prompt: "consent",
    state: stateToken,
  });

  return {
    url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    connectionId: null as string | null,
    mock: false,
  };
}

async function createMockGoogleConnection(ctx: IntegrationContext) {
  const existing = await prisma.integrationConnection.findFirst({
    where: {
      workspaceId: ctx.workspaceId,
      provider: IntegrationProvider.google_business,
    },
  });

  if (existing) {
    await syncMockLocations(existing.id);
    return existing;
  }

  const connection = await prisma.integrationConnection.create({
    data: {
      workspaceId: ctx.workspaceId,
      organizationId: ctx.organizationId,
      provider: IntegrationProvider.google_business,
      externalAccountId: "mock-google-account",
      status: IntegrationStatus.active,
      lastSyncAt: new Date(),
      credentials: {
        create: {
          encryptedAccess: Uint8Array.from(encryptCredential("mock-access-token")),
          scopes: ["business.manage"],
        },
      },
    },
  });

  await syncMockLocations(connection.id);
  return connection;
}

async function syncMockLocations(connectionId: string) {
  for (const loc of MOCK_GOOGLE_LOCATIONS) {
    await prisma.connectedLocation.upsert({
      where: {
        connectionId_externalLocationId: {
          connectionId,
          externalLocationId: loc.externalLocationId,
        },
      },
      create: {
        connectionId,
        externalLocationId: loc.externalLocationId,
        name: loc.name,
        address: loc.address,
      },
      update: { name: loc.name, address: loc.address },
    });
  }
}

export async function handleGoogleCallback(code: string, state: string) {
  const oauthState = await prisma.oAuthState.findUnique({ where: { stateToken: state } });
  if (!oauthState || oauthState.consumedAt || oauthState.expiresAt < new Date()) {
    throw new IntegrationError("Invalid or expired OAuth state", "INVALID_STATE", 400);
  }

  await prisma.oAuthState.update({
    where: { id: oauthState.id },
    data: { consumedAt: new Date() },
  });

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: INTEGRATION_CONFIG.googleClientId,
      client_secret: INTEGRATION_CONFIG.googleClientSecret,
      redirect_uri: INTEGRATION_CONFIG.googleRedirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    throw new IntegrationError("Failed to exchange OAuth code", "OAUTH_FAILED", 502);
  }

  const tokens = (await tokenRes.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  };

  const member = await prisma.organizationMember.findFirst({
    where: { userId: oauthState.userId },
    select: { organizationId: true },
  });

  const workspace = await prisma.workspace.findFirst({
    where: { organizationId: member?.organizationId },
    orderBy: { createdAt: "asc" },
  });

  if (!workspace || !member) {
    throw new IntegrationError("No workspace found for user", "NO_WORKSPACE", 400);
  }

  const connection = await prisma.integrationConnection.create({
    data: {
      workspaceId: workspace.id,
      organizationId: member.organizationId,
      provider: IntegrationProvider.google_business,
      status: IntegrationStatus.active,
      credentials: {
        create: {
          encryptedAccess: Uint8Array.from(encryptCredential(tokens.access_token)),
          encryptedRefresh: tokens.refresh_token
            ? Uint8Array.from(encryptCredential(tokens.refresh_token))
            : undefined,
          scopes: ["business.manage"],
          expiresAt: tokens.expires_in
            ? new Date(Date.now() + tokens.expires_in * 1000)
            : undefined,
        },
      },
    },
  });

  return connection.id;
}

export async function disconnectConnection(connectionId: string, ctx: IntegrationContext) {
  const { requireConnectionAccess } = await import("../access");
  await requireConnectionAccess(connectionId, ctx);
  await prisma.integrationConnection.delete({ where: { id: connectionId } });
}

export async function enqueueSyncRun(
  connectionId: string,
  ctx: IntegrationContext,
  type: SyncRunType = SyncRunType.reviews,
) {
  const { requireConnectionAccess } = await import("../access");
  const connection = await requireConnectionAccess(connectionId, ctx);

  const syncRun = await prisma.integrationSyncRun.create({
    data: {
      connectionId: connection.id,
      workspaceId: ctx.workspaceId,
      organizationId: ctx.organizationId,
      type,
      status: SyncRunStatus.running,
    },
  });

  return syncRun;
}

export async function hasActiveIntegration(ctx: IntegrationContext): Promise<boolean> {
  const count = await prisma.integrationConnection.count({
    where: {
      workspaceId: ctx.workspaceId,
      organizationId: ctx.organizationId,
      status: IntegrationStatus.active,
    },
  });
  return count > 0;
}
