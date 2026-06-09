import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { INTEGRATION_CONFIG } from "./config";

const ALGO = "aes-256-gcm";

function getKey(): Buffer {
  const hex = INTEGRATION_CONFIG.encryptionKey;
  if (hex && hex.length === 64) {
    return Buffer.from(hex, "hex");
  }
  // Dev fallback — not for production
  return Buffer.alloc(32, 0x42);
}

export function encryptCredential(plaintext: string): Buffer {
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]);
}

export function decryptCredential(data: Buffer): string {
  const key = getKey();
  const iv = data.subarray(0, 12);
  const tag = data.subarray(12, 28);
  const encrypted = data.subarray(28);
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}
