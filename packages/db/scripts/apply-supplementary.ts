import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";

// Prefer DIRECT_URL for DDL (required on Neon; safe for local where DIRECT_URL === DATABASE_URL)
const prisma = new PrismaClient({
  datasourceUrl: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
});

async function main() {
  const sqlPath = resolve(__dirname, "../prisma/migrations/supplementary.sql");
  const sql = readFileSync(sqlPath, "utf-8");

  const statements = sql
    .split(";")
    .map((s) =>
      s
        .split("\n")
        .filter((line) => !line.trim().startsWith("--"))
        .join("\n")
        .trim(),
    )
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    try {
      await prisma.$executeRawUnsafe(statement);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("already exists") || message.includes("duplicate")) {
        console.log(`Skipped (already applied): ${statement.slice(0, 60)}...`);
        continue;
      }
      throw err;
    }
  }

  console.log(`Applied ${statements.length} supplementary SQL statements`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
