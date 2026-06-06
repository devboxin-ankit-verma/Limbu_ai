import {
  AuthProvider,
  prisma,
  type OrgRole,
  type WorkspaceRole,
} from "@limbu/db";
import { hashPassword, validatePasswordStrength } from "../password";
import {
  generateSecureToken,
  hashToken,
  tokenExpiresAt,
} from "../tokens";
import { sendVerificationEmail } from "../email";

export async function findUserByEmail(email: string) {
  return prisma.user.findFirst({
    where: { email: email.toLowerCase(), deletedAt: null },
  });
}

export async function registerUser(input: {
  email: string;
  password: string;
  name?: string;
}): Promise<{ userId: string } | { error: string }> {
  const strengthError = validatePasswordStrength(input.password);
  if (strengthError) return { error: strengthError };

  const email = input.email.toLowerCase().trim();
  const existing = await findUserByEmail(email);
  if (existing) return { error: "An account with this email already exists" };

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      email,
      name: input.name?.trim() || null,
      passwordHash,
      authProvider: AuthProvider.email,
    },
  });

  const token = generateSecureToken();
  await prisma.emailVerificationToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt: tokenExpiresAt(24),
    },
  });

  await sendVerificationEmail(email, token, user.id);

  const { seedDefaultPreferences } = await import("@limbu/notifications");
  await seedDefaultPreferences(user.id).catch(() => {});

  return { userId: user.id };
}

export async function verifyEmailToken(
  token: string,
): Promise<{ success: true } | { error: string }> {
  const record = await prisma.emailVerificationToken.findFirst({
    where: {
      tokenHash: hashToken(token),
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });

  if (!record) return { error: "Invalid or expired verification link" };
  if (record.user.deletedAt) return { error: "Account not found" };

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: new Date() },
    }),
    prisma.emailVerificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return { success: true };
}

export async function resendVerificationEmail(
  email: string,
): Promise<{ success: true } | { error: string }> {
  const user = await findUserByEmail(email.toLowerCase().trim());
  if (!user) return { success: true };
  if (user.emailVerified) return { error: "Email is already verified" };

  await prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } });

  const token = generateSecureToken();
  await prisma.emailVerificationToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt: tokenExpiresAt(24),
    },
  });

  await sendVerificationEmail(user.email, token, user.id);
  return { success: true };
}

export async function requestPasswordReset(
  email: string,
): Promise<{ success: true }> {
  const user = await findUserByEmail(email.toLowerCase().trim());
  if (!user || !user.passwordHash) return { success: true };

  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

  const token = generateSecureToken();
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt: tokenExpiresAt(1),
    },
  });

  const { sendPasswordResetEmail } = await import("../email");
  await sendPasswordResetEmail(user.email, token, user.id);

  return { success: true };
}

export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<{ success: true } | { error: string }> {
  const strengthError = validatePasswordStrength(newPassword);
  if (strengthError) return { error: strengthError };

  const record = await prisma.passwordResetToken.findFirst({
    where: {
      tokenHash: hashToken(token),
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (!record) return { error: "Invalid or expired reset link" };

  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    prisma.session.deleteMany({ where: { userId: record.userId } }),
    prisma.refreshToken.deleteMany({ where: { userId: record.userId } }),
  ]);

  return { success: true };
}

export async function linkOAuthAccount(input: {
  provider: AuthProvider;
  providerAccountId: string;
  email: string;
  name?: string | null;
  image?: string | null;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date | null;
}): Promise<{ userId: string; isNew: boolean }> {
  const email = input.email.toLowerCase().trim();

  const existingAccount = await prisma.oAuthAccount.findUnique({
    where: {
      provider_providerAccountId: {
        provider: input.provider,
        providerAccountId: input.providerAccountId,
      },
    },
    include: { user: true },
  });

  if (existingAccount && !existingAccount.user.deletedAt) {
    await prisma.oAuthAccount.update({
      where: { id: existingAccount.id },
      data: {
        accessToken: input.accessToken,
        refreshToken: input.refreshToken,
        expiresAt: input.expiresAt,
      },
    });
    return { userId: existingAccount.userId, isNew: false };
  }

  let user = await findUserByEmail(email);

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: input.name ?? null,
        avatarUrl: input.image ?? null,
        authProvider: input.provider,
        emailVerified: new Date(),
      },
    });
  } else {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name ?? input.name ?? null,
        avatarUrl: user.avatarUrl ?? input.image ?? null,
        emailVerified: user.emailVerified ?? new Date(),
      },
    });
  }

  await prisma.oAuthAccount.upsert({
    where: {
      provider_providerAccountId: {
        provider: input.provider,
        providerAccountId: input.providerAccountId,
      },
    },
    create: {
      userId: user.id,
      provider: input.provider,
      providerAccountId: input.providerAccountId,
      accessToken: input.accessToken,
      refreshToken: input.refreshToken,
      expiresAt: input.expiresAt,
    },
    update: {
      accessToken: input.accessToken,
      refreshToken: input.refreshToken,
      expiresAt: input.expiresAt,
    },
  });

  return { userId: user.id, isNew: !existingAccount && user.createdAt > new Date(Date.now() - 5000) };
}

export async function authenticateCredentials(
  email: string,
  password: string,
): Promise<
  | { user: { id: string; email: string; name: string | null; image: string | null; emailVerified: Date | null } }
  | { error: string }
> {
  const user = await findUserByEmail(email.toLowerCase().trim());
  if (!user || !user.passwordHash) {
    return { error: "Invalid email or password" };
  }

  const { verifyPassword } = await import("../password");
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return { error: "Invalid email or password" };

  if (!user.emailVerified) {
    return { error: "EMAIL_NOT_VERIFIED" };
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.avatarUrl,
      emailVerified: user.emailVerified,
    },
  };
}

export async function switchTenantContext(
  userId: string,
  organizationId: string,
  workspaceId?: string,
): Promise<{
  organizationId: string;
  orgRole: OrgRole;
  workspaceId: string | null;
  workspaceRole: WorkspaceRole | null;
}> {
  const orgMember = await prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId, userId } },
    select: { role: true, status: true },
  });

  if (!orgMember || orgMember.status !== "active") {
    throw new Error("ORG_ACCESS_DENIED");
  }

  if (!workspaceId) {
    return {
      organizationId,
      orgRole: orgMember.role,
      workspaceId: null,
      workspaceRole: null,
    };
  }

  const wsMember = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
    select: { role: true, status: true, workspace: { select: { organizationId: true } } },
  });

  if (
    !wsMember ||
    wsMember.status !== "active" ||
    wsMember.workspace.organizationId !== organizationId
  ) {
    throw new Error("WORKSPACE_ACCESS_DENIED");
  }

  return {
    organizationId,
    orgRole: orgMember.role,
    workspaceId,
    workspaceRole: wsMember.role,
  };
}
