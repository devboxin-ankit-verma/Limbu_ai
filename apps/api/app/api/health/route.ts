import { prisma } from "@limbu/db";
import { INTEGRATION_CONFIG } from "@limbu/integrations";
import { NextResponse } from "next/server";

export async function GET() {
  const checks: Record<string, { ok: boolean; detail?: string }> = {};

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { ok: true };
  } catch (err) {
    checks.database = {
      ok: false,
      detail: err instanceof Error ? err.message : "DB unreachable",
    };
  }

  checks.integrations = {
    ok: true,
    detail: INTEGRATION_CONFIG.mockGoogle ? "mock_google" : INTEGRATION_CONFIG.googleClientId ? "live" : "unconfigured",
  };

  checks.worker = {
    ok: Boolean(process.env.WORKFLOW_WORKER_SECRET),
    detail: process.env.WORKFLOW_WORKER_SECRET ? "secrets_set" : "dev_open",
  };

  checks.billing = {
    ok: process.env.BILLING_MOCK_STRIPE === "true" || Boolean(process.env.STRIPE_SECRET_KEY),
    detail: process.env.BILLING_MOCK_STRIPE === "true" ? "mock" : "stripe",
  };

  const allOk = Object.values(checks).every((c) => c.ok);

  return NextResponse.json(
    {
      ok: allOk,
      service: "@limbu/api",
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: allOk ? 200 : 503 },
  );
}
