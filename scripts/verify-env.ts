/**
 * Validates environment configuration across Limbu monorepo apps.
 * Run: npm run verify:env
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(__dirname, "..");
const isProduction = process.env.NODE_ENV === "production";

type CheckResult = { level: "error" | "warn" | "ok"; message: string };

const results: CheckResult[] = [];

function loadEnvFile(relativePath: string): Record<string, string> {
  const full = join(ROOT, relativePath);
  if (!existsSync(full)) return {};
  const vars: Record<string, string> = {};
  for (const line of readFileSync(full, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    vars[key] = value;
  }
  return vars;
}

function mergeEnv(...sources: Record<string, string>[]): Record<string, string> {
  return Object.assign({}, ...sources);
}

function requireVar(
  env: Record<string, string>,
  key: string,
  app: string,
  level: "error" | "warn" = "error",
) {
  const value = env[key] ?? process.env[key];
  if (!value || value.trim() === "") {
    results.push({
      level,
      message: `[${app}] Missing ${key}`,
    });
    return false;
  }
  return true;
}

function warnIfTrue(env: Record<string, string>, key: string, app: string, message: string) {
  const value = (env[key] ?? process.env[key] ?? "").toLowerCase();
  if (value === "true" || value === "1") {
    results.push({ level: isProduction ? "error" : "warn", message: `[${app}] ${message}` });
  }
}

// Load per-app env (process.env takes precedence)
const webEnv = mergeEnv(
  loadEnvFile("apps/web/.env.local"),
  loadEnvFile("apps/web/.env"),
);
const apiEnv = mergeEnv(
  loadEnvFile("apps/api/.env.local"),
  loadEnvFile("apps/api/.env"),
);
const adminEnv = mergeEnv(
  loadEnvFile("apps/admin/.env.local"),
  loadEnvFile("apps/admin/.env"),
);
const workerEnv = mergeEnv(loadEnvFile("apps/worker/.env"));

const allApps = [
  { name: "web", env: webEnv },
  { name: "api", env: apiEnv },
  { name: "admin", env: adminEnv },
  { name: "worker", env: workerEnv },
];

console.log("\n🔍 Limbu Environment Verification\n");

// Critical shared vars
for (const { name, env } of allApps) {
  requireVar(env, "DATABASE_URL", name);
  if (name !== "worker") {
    requireVar(env, "AUTH_SECRET", name);
  }
}

// API_URL for frontends
for (const name of ["web", "admin"] as const) {
  const env = name === "web" ? webEnv : adminEnv;
  const apiUrl = env.API_URL ?? process.env.API_URL;
  if (!apiUrl) {
    results.push({ level: "error", message: `[${name}] Missing API_URL (should point to api :3002)` });
  } else if (!apiUrl.includes("3002") && apiUrl.includes("localhost")) {
    results.push({ level: "warn", message: `[${name}] API_URL=${apiUrl} — expected http://localhost:3002 for local dev` });
  }
}

// AUTH_SECRET consistency
const secrets = allApps
  .filter((a) => a.name !== "worker")
  .map((a) => a.env.AUTH_SECRET ?? process.env.AUTH_SECRET)
  .filter(Boolean);
if (secrets.length > 1 && new Set(secrets).size > 1) {
  results.push({
    level: "error",
    message: "AUTH_SECRET differs between web/api/admin — sessions will break",
  });
}

// AI provider keys
const aiKeys = ["OPENAI_API_KEY", "ANTHROPIC_API_KEY", "GOOGLE_AI_API_KEY"];
const hasAiKey = aiKeys.some(
  (k) =>
    (apiEnv[k] ?? process.env[k]) ||
    (webEnv[k] ?? process.env[k]) ||
    (workerEnv[k] ?? process.env[k]),
);
if (!hasAiKey) {
  results.push({
    level: "warn",
    message: "No AI provider key set — chat, post generation, and review AI will fail at runtime",
  });
}

// Worker secrets in production
if (isProduction) {
  for (const key of [
    "WORKFLOW_WORKER_SECRET",
    "RAG_WORKER_SECRET",
    "NOTIFICATION_WORKER_SECRET",
  ]) {
    const apiVal = apiEnv[key] ?? process.env[key];
    const workerVal = workerEnv[key] ?? process.env[key];
    if (!apiVal || !workerVal) {
      results.push({ level: "error", message: `Missing ${key} in api/worker (required in production)` });
    } else if (apiVal !== workerVal) {
      results.push({ level: "error", message: `${key} mismatch between api and worker` });
    }
  }
} else {
  for (const key of [
    "WORKFLOW_WORKER_SECRET",
    "RAG_WORKER_SECRET",
    "NOTIFICATION_WORKER_SECRET",
  ]) {
    if (!(apiEnv[key] ?? workerEnv[key] ?? process.env[key])) {
      results.push({
        level: "warn",
        message: `${key} not set — worker HTTP endpoints accept any request in dev`,
      });
    }
  }
}

// Dev bypass flags
for (const { name, env } of allApps) {
  warnIfTrue(env, "DEV_SKIP_AUTH", name, "DEV_SKIP_AUTH=true bypasses authentication");
  warnIfTrue(env, "BILLING_MOCK_STRIPE", name, "BILLING_MOCK_STRIPE=true — not for production");
  warnIfTrue(env, "NOTIFICATION_MOCK_EMAIL", name, "NOTIFICATION_MOCK_EMAIL=true — emails not sent");
}

// Integration mock hint
const mockGoogle = apiEnv.INTEGRATION_MOCK_GOOGLE ?? process.env.INTEGRATION_MOCK_GOOGLE;
const googleId = apiEnv.GOOGLE_BUSINESS_CLIENT_ID ?? process.env.GOOGLE_BUSINESS_CLIENT_ID;
if (!googleId && mockGoogle !== "true") {
  results.push({
    level: "warn",
    message: "No GOOGLE_BUSINESS_CLIENT_ID — set INTEGRATION_MOCK_GOOGLE=true for local GMB dev",
  });
}

// Print results
const errors = results.filter((r) => r.level === "error");
const warnings = results.filter((r) => r.level === "warn");

if (errors.length === 0 && warnings.length === 0) {
  console.log("✅ All checks passed.\n");
  console.log("Start services:");
  console.log("  npm run dev:api     # :3002");
  console.log("  npm run dev:worker  # :3001");
  console.log("  npm run dev:web     # :3000\n");
  process.exit(0);
}

for (const r of errors) console.log(`❌ ${r.message}`);
for (const r of warnings) console.log(`⚠️  ${r.message}`);

console.log(`\n${errors.length} error(s), ${warnings.length} warning(s)`);
console.log("See ENV_SETUP.md for full variable reference.\n");

process.exit(errors.length > 0 ? 1 : 0);
