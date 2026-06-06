import { billingErrorResponse } from "@limbu/shared/api";
import { requireBillingSession } from "@limbu/shared/session";
import { handleStripeWebhook } from "@limbu/billing";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  try {
    const result = await handleStripeWebhook(rawBody, signature);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Stripe webhook error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Webhook processing failed" },
      { status: 400 },
    );
  }
}

export const runtime = "nodejs";
