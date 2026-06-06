import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { AuthProvider } from "@limbu/db";
import { authConfig } from "@/auth.config";
import {
  authenticateCredentials,
  createDbSession,
  isSessionValid,
  linkOAuthAccount,
  loadTenantContext,
} from "@limbu/auth";

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const result = await authenticateCredentials(email, password);
        if ("error" in result) {
          if (result.error === "EMAIL_NOT_VERIFIED") {
            const err = new CredentialsSignin();
            err.code = "EMAIL_NOT_VERIFIED";
            throw err;
          }
          return null;
        }

        const tenant = await loadTenantContext(result.user.id);
        const { sessionId } = await createDbSession(result.user.id);

        return {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          image: result.user.image,
          emailVerified: result.user.emailVerified,
          organizationId: tenant.organizationId,
          orgRole: tenant.orgRole,
          workspaceId: tenant.workspaceId,
          workspaceRole: tenant.workspaceRole,
          isSuperAdmin: tenant.isSuperAdmin,
          sessionId,
        };
      },
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: false,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      allowDangerousEmailAccountLinking: false,
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (!account || account.provider === "credentials") return true;
      if (!user.email) return false;

      const providerMap: Record<string, AuthProvider> = {
        google: AuthProvider.google,
        github: AuthProvider.github,
      };

      const provider = providerMap[account.provider];
      if (!provider) return false;

      const { userId } = await linkOAuthAccount({
        provider,
        providerAccountId: account.providerAccountId,
        email: user.email,
        name: user.name,
        image: user.image,
        accessToken: account.access_token,
        refreshToken: account.refresh_token,
        expiresAt: account.expires_at ? new Date(account.expires_at * 1000) : null,
      });

      const tenant = await loadTenantContext(userId);
      const { sessionId } = await createDbSession(userId);

      user.id = userId;
      user.organizationId = tenant.organizationId;
      user.orgRole = tenant.orgRole;
      user.workspaceId = tenant.workspaceId;
      user.workspaceRole = tenant.workspaceRole;
      user.isSuperAdmin = tenant.isSuperAdmin;
      user.sessionId = sessionId;
      user.emailVerified = new Date();

      return true;
    },
    async jwt({ token, user, trigger, session }) {
      const baseJwt = authConfig.callbacks.jwt;
      if (!baseJwt) return token;

      if (user) {
        return baseJwt({ token, user, trigger, session });
      }

      if (token.sessionId) {
        const valid = await isSessionValid(token.sessionId as string);
        if (!valid) return { ...token, expired: true };
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
  },
  events: {
    async signOut(message) {
      if ("token" in message && message.token?.sessionId) {
        const { prisma } = await import("@limbu/db");
        await prisma.session.deleteMany({
          where: { id: message.token.sessionId as string },
        });
      }
    },
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-authjs.session-token"
          : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
});
