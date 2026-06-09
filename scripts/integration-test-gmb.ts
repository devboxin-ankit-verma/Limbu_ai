/**
 * GMB integration smoke test (requires running DB + seeded dev tenant).
 * Run: npx tsx scripts/integration-test-gmb.ts
 */
import assert from "node:assert/strict";

const API_URL = process.env.API_URL ?? "http://localhost:3002";

async function testHealth() {
  const res = await fetch(`${API_URL}/api/health`);
  const body = await res.json();
  console.log("✓ health", body.ok ? "ok" : "degraded", body.checks);
}

async function testPublicPlans() {
  const res = await fetch(`${API_URL}/api/billing/plans`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok(Array.isArray(body.plans));
  console.log("✓ billing plans", body.plans.length, "plans");
}

async function main() {
  console.log("\n🧪 GMB Integration Smoke Tests\n");
  await testHealth();
  await testPublicPlans();
  console.log("\n✅ Smoke tests passed (auth-required flows need session cookie).\n");
}

main().catch((err) => {
  console.error("❌", err);
  process.exit(1);
});
