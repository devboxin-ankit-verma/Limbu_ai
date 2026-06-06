import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@limbu/auth", "@limbu/admin", "@limbu/analytics", "@limbu/billing", "@limbu/shared", "@limbu/ui"],
  serverExternalPackages: ["@prisma/client", "@limbu/db"],
  outputFileTracingRoot: path.join(__dirname, "../../"),
};

export default nextConfig;
