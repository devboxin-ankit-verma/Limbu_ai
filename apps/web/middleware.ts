import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

export default NextAuth(authConfig).auth;

// Must stay in sync with PROTECTED_PAGE_PREFIXES and authPages in @limbu/shared/middleware.
// Next.js 15 requires a static literal array here (no spread, map, or imports).
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/onboarding/:path*",
    "/organizations/:path*",
    "/chat/:path*",
    "/workflows/:path*",
    "/agents/:path*",
    "/knowledge/:path*",
    "/notifications/:path*",
    "/posts/:path*",
    "/calendar/:path*",
    "/reviews/:path*",
    "/locations/:path*",
    "/integrations/:path*",
    "/analytics/:path*",
    "/magic-qr/:path*",
    "/invite/:path*",
    "/login",
    "/register",
  ],
};
