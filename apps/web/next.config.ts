import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@limbu/auth", "@limbu/org", "@limbu/workspace", "@limbu/chat", "@limbu/content", "@limbu/integrations", "@limbu/reviews", "@limbu/ai-core", "@limbu/rag", "@limbu/agents", "@limbu/workflows", "@limbu/billing", "@limbu/analytics", "@limbu/notifications", "@limbu/worker", "@limbu/shared", "@limbu/ui"],
  serverExternalPackages: ["@prisma/client", "@limbu/db"],
  outputFileTracingRoot: path.join(__dirname, "../../"),
  async rewrites() {
    const apiUrl = process.env.API_URL ?? process.env.API_INTERNAL_URL ?? "http://localhost:3002";
    return [
      {
        source: "/uploads/:path*",
        destination: `${apiUrl}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
