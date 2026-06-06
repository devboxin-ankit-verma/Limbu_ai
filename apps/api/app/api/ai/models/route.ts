import { requireChatSession } from "@limbu/shared/session";
import { listAvailableModels } from "@limbu/ai-core";
import { NextResponse } from "next/server";

export async function GET() {
  const result = await requireChatSession();
  if (result.error === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const models = listAvailableModels().map((model) => ({
    id: model.model,
    provider: model.provider,
    maxContextTokens: model.maxContextTokens,
    maxOutputTokens: model.maxOutputTokens,
  }));

  return NextResponse.json({ models });
}
