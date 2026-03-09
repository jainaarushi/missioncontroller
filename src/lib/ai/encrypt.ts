import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

// AES-256-GCM encryption for user API keys
// The encryption key is derived from SUPABASE_SERVICE_ROLE_KEY or a dedicated secret
function getEncryptionKey(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  // Create a 32-byte key from the secret using a simple hash
  const crypto = require("crypto");
  return crypto.createHash("sha256").update(secret).digest();
}

export function encryptApiKey(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  // Format: iv:authTag:encrypted
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

export function decryptApiKey(ciphertext: string): string {
  const key = getEncryptionKey();
  const [ivHex, authTagHex, encrypted] = ciphertext.split(":");

  if (!ivHex || !authTagHex || !encrypted) {
    throw new Error("Invalid encrypted key format");
  }

  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

// Mask a key for display: sk-ant-api03-****...****wAA
export function maskApiKey(key: string): string {
  if (key.length < 12) return "****";
  return key.substring(0, 12) + "****" + key.substring(key.length - 4);
}
