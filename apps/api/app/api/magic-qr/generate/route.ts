import { prisma } from "@limbu/db";
import { gmbErrorResponse } from "@limbu/shared/api/gmb-errors";
import { missingWorkspaceResponse } from "@limbu/shared/api";
import { requireWorkspaceSession } from "@limbu/shared/session";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const result = await requireWorkspaceSession();
  if (result.error === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (result.error === "NO_WORKSPACE") return missingWorkspaceResponse();

  try {
    const { assertFeature } = await import("@limbu/billing");
    await assertFeature(result.context.organizationId, "magic_qr");

    const body = await request.json();
    const location = await prisma.connectedLocation.findFirst({
      where: {
        id: body.locationId,
        connection: {
          workspaceId: result.context.workspaceId,
          organizationId: result.context.organizationId,
        },
      },
    });

    if (!location) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    const funnelUrl = `https://review.limbu.ai/${location.externalLocationId}?ws=${result.context.workspaceId}`;
    const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(funnelUrl)}`;

    await prisma.connectedLocation.update({
      where: { id: location.id },
      data: {
        metadata: {
          ...(location.metadata as object),
          magicQr: { funnelUrl, generatedAt: new Date().toISOString() },
        },
      },
    });

    await prisma.productEvent.create({
      data: {
        userId: result.context.userId,
        organizationId: result.context.organizationId,
        workspaceId: result.context.workspaceId,
        eventName: "magic_qr.generated",
        properties: { locationId: location.id },
      },
    });

    return NextResponse.json({ qrDataUrl, funnelUrl });
  } catch (err) {
    return gmbErrorResponse(err);
  }
}
