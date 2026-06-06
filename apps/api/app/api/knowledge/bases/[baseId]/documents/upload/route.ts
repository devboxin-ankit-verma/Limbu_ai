import { ragErrorResponse, missingWorkspaceResponse } from "@limbu/shared/api";
import { requireRagSession } from "@limbu/shared/session";
import { uploadDocument } from "@limbu/rag";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ baseId: string }> };

export async function POST(request: Request, { params }: Params) {
  const result = await requireRagSession();
  if (result.error === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (result.error === "NO_WORKSPACE") return missingWorkspaceResponse();

  try {
    const { baseId } = await params;
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const document = await uploadDocument(baseId, result.context, {
      filename: file.name,
      mimeType: file.type || undefined,
      buffer,
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (err) {
    return ragErrorResponse(err);
  }
}
