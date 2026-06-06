import { KnowledgeBaseScope, prisma } from "@limbu/db";
import { assertScopeAccess } from "../access";
import { RagForbiddenError, RagNotFoundError, RagValidationError } from "../errors";
import { createKnowledgeBaseSchema, updateKnowledgeBaseSchema } from "../validators";
import type { KnowledgeBaseRecord, RagAccessContext } from "../types";

function toRecord(kb: {
  id: string;
  organizationId: string;
  workspaceId: string | null;
  userId: string | null;
  scope: KnowledgeBaseScope;
  name: string;
  description: string | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count?: { documents: number };
}): KnowledgeBaseRecord {
  return {
    id: kb.id,
    organizationId: kb.organizationId,
    workspaceId: kb.workspaceId,
    userId: kb.userId,
    scope: kb.scope,
    name: kb.name,
    description: kb.description,
    isDefault: kb.isDefault,
    documentCount: kb._count?.documents,
    createdAt: kb.createdAt,
    updatedAt: kb.updatedAt,
  };
}

export async function listKnowledgeBases(ctx: RagAccessContext) {
  const bases = await prisma.knowledgeBase.findMany({
    where: {
      organizationId: ctx.organizationId,
      OR: [
        { scope: KnowledgeBaseScope.workspace, workspaceId: ctx.workspaceId ?? undefined },
        { scope: KnowledgeBaseScope.organization },
        { scope: KnowledgeBaseScope.personal, userId: ctx.userId },
      ],
    },
    orderBy: [{ scope: "asc" }, { name: "asc" }],
    include: { _count: { select: { documents: true } } },
  });

  return bases.map(toRecord);
}

export async function getOrCreateDefaultKnowledgeBase(
  ctx: RagAccessContext,
  scope: KnowledgeBaseScope,
) {
  const existing = await prisma.knowledgeBase.findFirst({
    where: {
      organizationId: ctx.organizationId,
      scope,
      isDefault: true,
      ...(scope === KnowledgeBaseScope.workspace ? { workspaceId: ctx.workspaceId } : {}),
      ...(scope === KnowledgeBaseScope.personal ? { userId: ctx.userId } : {}),
      ...(scope === KnowledgeBaseScope.organization ? { workspaceId: null, userId: null } : {}),
    },
    include: { _count: { select: { documents: true } } },
  });

  if (existing) return toRecord(existing);

  return createKnowledgeBase(ctx, {
    name:
      scope === KnowledgeBaseScope.workspace
        ? "Workspace Knowledge"
        : scope === KnowledgeBaseScope.organization
          ? "Organization Knowledge"
          : "Personal Knowledge",
    scope,
    isDefault: true,
  });
}

export async function createKnowledgeBase(
  ctx: RagAccessContext,
  input: {
    name: string;
    description?: string;
    scope: KnowledgeBaseScope;
    workspaceId?: string;
    isDefault?: boolean;
  },
) {
  const parsed = createKnowledgeBaseSchema.safeParse(input);
  if (!parsed.success) {
    throw new RagValidationError(
      "Invalid knowledge base",
      parsed.error.flatten().fieldErrors as Record<string, string[]>,
    );
  }

  const workspaceId =
    parsed.data.scope === KnowledgeBaseScope.workspace
      ? (parsed.data.workspaceId ?? ctx.workspaceId)
      : null;
  const userId = parsed.data.scope === KnowledgeBaseScope.personal ? ctx.userId : null;

  if (parsed.data.scope === KnowledgeBaseScope.workspace && !workspaceId) {
    throw new RagValidationError("workspaceId is required for workspace knowledge bases");
  }

  await assertScopeAccess(
    parsed.data.scope,
    { organizationId: ctx.organizationId, workspaceId: workspaceId ?? null, userId },
    ctx,
    true,
  );

  const kb = await prisma.knowledgeBase.create({
    data: {
      organizationId: ctx.organizationId,
      workspaceId,
      userId,
      scope: parsed.data.scope,
      name: parsed.data.name,
      description: parsed.data.description,
      isDefault: input.isDefault ?? false,
    },
    include: { _count: { select: { documents: true } } },
  });

  return toRecord(kb);
}

export async function updateKnowledgeBase(
  knowledgeBaseId: string,
  ctx: RagAccessContext,
  input: unknown,
) {
  await assertScopeAccessForId(knowledgeBaseId, ctx, true);
  const parsed = updateKnowledgeBaseSchema.safeParse(input);
  if (!parsed.success) {
    throw new RagValidationError(
      "Invalid update",
      parsed.error.flatten().fieldErrors as Record<string, string[]>,
    );
  }

  const kb = await prisma.knowledgeBase.update({
    where: { id: knowledgeBaseId },
    data: {
      ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
      ...(parsed.data.description !== undefined ? { description: parsed.data.description } : {}),
    },
    include: { _count: { select: { documents: true } } },
  });

  return toRecord(kb);
}

export async function deleteKnowledgeBase(knowledgeBaseId: string, ctx: RagAccessContext) {
  const kb = await assertScopeAccessForId(knowledgeBaseId, ctx, true);
  if (kb.isDefault) {
    throw new RagValidationError("Default knowledge bases cannot be deleted");
  }

  const documents = await prisma.knowledgeDocument.findMany({
    where: { knowledgeBaseId },
    select: { id: true, s3Key: true },
  });

  await prisma.knowledgeBase.delete({ where: { id: knowledgeBaseId } });

  return { deletedDocuments: documents.length };
}

async function assertScopeAccessForId(
  knowledgeBaseId: string,
  ctx: RagAccessContext,
  write?: boolean,
) {
  const kb = await prisma.knowledgeBase.findUnique({ where: { id: knowledgeBaseId } });
  if (!kb || kb.organizationId !== ctx.organizationId) {
    throw new RagNotFoundError("Knowledge base not found");
  }
  await assertScopeAccess(kb.scope, kb, ctx, write);
  return kb;
}

export async function getKnowledgeBase(knowledgeBaseId: string, ctx: RagAccessContext) {
  const kb = await prisma.knowledgeBase.findUnique({
    where: { id: knowledgeBaseId },
    include: { _count: { select: { documents: true } } },
  });
  if (!kb || kb.organizationId !== ctx.organizationId) {
    throw new RagNotFoundError("Knowledge base not found");
  }
  await assertScopeAccess(kb.scope, kb, ctx);
  return toRecord(kb);
}
