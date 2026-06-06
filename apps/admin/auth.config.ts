import type { OrgRole, WorkspaceRole } from "@limbu/db";
import type { NextAuthConfig } from "next-auth";
const publicPaths = ["/login"] as const;

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
    updateAge: 60 * 60,
  },
  trustHost: true,
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;
      const isPublic = publicPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`));

      if (isPublic) {
        if (isLoggedIn) return Response.redirect(new URL("/", request.nextUrl));
        return true;
      }

      return isLoggedIn;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        token.emailVerified = user.emailVerified?.toISOString() ?? null;
        token.organizationId = user.organizationId ?? null;
        token.orgRole = user.orgRole ?? null;
        token.workspaceId = user.workspaceId ?? null;
        token.workspaceRole = user.workspaceRole ?? null;
        token.isSuperAdmin = user.isSuperAdmin ?? false;
        token.sessionId = user.sessionId;
      }

      if (trigger === "update" && session) {
        if (session.organizationId !== undefined) {
          token.organizationId = session.organizationId;
        }
        if (session.orgRole !== undefined) token.orgRole = session.orgRole;
        if (session.workspaceId !== undefined) token.workspaceId = session.workspaceId;
        if (session.workspaceRole !== undefined) {
          token.workspaceRole = session.workspaceRole;
        }
        if (session.isSuperAdmin !== undefined) token.isSuperAdmin = session.isSuperAdmin;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = (token.name as string) ?? null;
        session.user.image = (token.picture as string) ?? null;
        session.user.emailVerified = token.emailVerified
          ? new Date(token.emailVerified as string)
          : null;
        session.user.organizationId = (token.organizationId as string) ?? null;
        session.user.orgRole = (token.orgRole as OrgRole) ?? null;
        session.user.workspaceId = (token.workspaceId as string) ?? null;
        session.user.workspaceRole = (token.workspaceRole as WorkspaceRole) ?? null;
        session.user.isSuperAdmin = Boolean(token.isSuperAdmin);
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
