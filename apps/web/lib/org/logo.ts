import { mkdir, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "organizations");
const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Map([
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
  ["image/webp", "webp"],
  ["image/svg+xml", "svg"],
]);

export function getOrganizationLogoUrl(organizationId: string, ext?: string): string | null {
  if (ext) return `/uploads/organizations/${organizationId}/logo.${ext}`;
  return null;
}

export async function findOrganizationLogoUrl(organizationId: string): Promise<string | null> {
  const dir = path.join(UPLOAD_DIR, organizationId);
  try {
    const files = await readdir(dir);
    const logo = files.find((f) => f.startsWith("logo."));
    return logo ? `/uploads/organizations/${organizationId}/${logo}` : null;
  } catch {
    return null;
  }
}

export async function saveOrganizationLogo(
  organizationId: string,
  file: File,
): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("INVALID_FILE_TYPE");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("FILE_TOO_LARGE");
  }

  const ext = ALLOWED_TYPES.get(file.type)!;
  const dir = path.join(UPLOAD_DIR, organizationId);
  await mkdir(dir, { recursive: true });

  try {
    const existing = await readdir(dir);
    for (const f of existing) {
      if (f.startsWith("logo.")) await unlink(path.join(dir, f));
    }
  } catch {
    /* empty dir */
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, `logo.${ext}`), buffer);

  return `/uploads/organizations/${organizationId}/logo.${ext}`;
}
