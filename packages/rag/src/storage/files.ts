import { createHash } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { RAG_CONFIG } from "../config";

function resolveUploadRoot() {
  return path.isAbsolute(RAG_CONFIG.uploadDir)
    ? RAG_CONFIG.uploadDir
    : path.join(process.cwd(), RAG_CONFIG.uploadDir);
}

export async function saveUploadedFile(input: {
  organizationId: string;
  knowledgeBaseId: string;
  documentId: string;
  filename: string;
  buffer: Buffer;
}) {
  const safeName = input.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const relativeKey = path.join(
    input.organizationId,
    input.knowledgeBaseId,
    input.documentId,
    safeName,
  );
  const absolutePath = path.join(resolveUploadRoot(), relativeKey);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, input.buffer);
  return {
    storageKey: relativeKey.replace(/\\/g, "/"),
    absolutePath,
    checksum: createHash("sha256").update(input.buffer).digest("hex"),
    size: input.buffer.length,
  };
}

export async function readStoredFile(storageKey: string): Promise<Buffer> {
  const absolutePath = path.join(resolveUploadRoot(), storageKey);
  return readFile(absolutePath);
}

export async function deleteStoredFile(storageKey: string) {
  const absolutePath = path.join(resolveUploadRoot(), storageKey);
  try {
    await unlink(absolutePath);
  } catch {
    // ignore missing files
  }
}
