import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { PROTECTED_PAGE_PREFIXES, authPages } from "@limbu/shared/middleware";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    ...PROTECTED_PAGE_PREFIXES.map((prefix) => `${prefix}/:path*`),
    ...authPages,
  ],
};
