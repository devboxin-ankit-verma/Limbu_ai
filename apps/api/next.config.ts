import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@limbu/auth",
    "@limbu/org",
    "@limbu/workspace",
    "@limbu/chat",
    "@limbu/content",
    "@limbu/integrations",
    "@limbu/reviews",
    "@limbu/ai-core",
    "@limbu/rag",
    "@limbu/agents",
    "@limbu/workflows",
    "@limbu/billing",
    "@limbu/analytics",
    "@limbu/admin",
    "@limbu/notifications",
    "@limbu/worker",
    "@limbu/shared",
  ],
  serverExternalPackages: ["@prisma/client", "@limbu/db"],
  outputFileTracingRoot: path.join(__dirname, "../../"),
};

export default nextConfig;
