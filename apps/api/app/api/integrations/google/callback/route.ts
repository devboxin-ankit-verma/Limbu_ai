import { handleGoogleCallback } from "@limbu/integrations";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const webUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  if (error || !code || !state) {
    return NextResponse.redirect(`${webUrl}/integrations?error=oauth_denied`);
  }

  try {
    const connectionId = await handleGoogleCallback(code, state);
    return NextResponse.redirect(`${webUrl}/integrations?connected=${connectionId}`);
  } catch {
    return NextResponse.redirect(`${webUrl}/integrations?error=oauth_failed`);
  }
}
