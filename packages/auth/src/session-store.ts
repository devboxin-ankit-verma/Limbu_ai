import { prisma } from "@limbu/db";
import { generateSecureToken, hashToken, tokenExpiresAt } from "./tokens";

const SESSION_HOURS = 24;
const REFRESH_DAYS = 30;

export interface SessionMeta {
  ip?: string | null;
  userAgent?: string | null;
}

export async function createDbSession(
  userId: string,
  meta: SessionMeta = {},
): Promise<{ sessionId: string; refreshToken: string }> {
  const sessionToken = generateSecureToken();
  const refreshToken = generateSecureToken(48);

  const session = await prisma.session.create({
    data: {
      userId,
      tokenHash: hashToken(sessionToken),
      ip: meta.ip ?? null,
      userAgent: meta.userAgent ?? null,
      expiresAt: tokenExpiresAt(SESSION_HOURS),
    },
  });

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(refreshToken),
      expiresAt: tokenExpiresAt(REFRESH_DAYS * 24),
    },
  });

  return { sessionId: session.id, refreshToken };
}

export async function revokeUserSessions(userId: string): Promise<void> {
  await prisma.$transaction([
    prisma.session.deleteMany({ where: { userId } }),
    prisma.refreshToken.deleteMany({ where: { userId } }),
  ]);
}

export async function isSessionValid(sessionId: string): Promise<boolean> {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { expiresAt: true },
  });
  if (!session) return false;
  return session.expiresAt > new Date();
}
