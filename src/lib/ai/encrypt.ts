import { createCipheriv, createDecipheriv, createHash, pbkdf2Sync, randomBytes } from "crypto";

// AES-256-GCM encryption for user API keys
// Key is derived using PBKDF2 with a fixed salt from the secret

const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_SALT = "agentstudio-key-encryption-v1"; // Fixed salt — secret provides entropy

function getEncryptionKey(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET;
  if (secret) {
    // Proper KDF when dedicated secret is set
    return pbkdf2Sync(secret, PBKDF2_SALT, PBKDF2_ITERATIONS, 32, "sha512");
  }

  // Fallback: derive from service role key (less ideal but acceptable for dev)
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey) {
    return pbkdf2Sync(serviceKey, PBKDF2_SALT, PBKDF2_ITERATIONS, 32, "sha512");
  }

  // Local mode without any secrets — derive a machine-local key
  // This is for demo/dev only; keys won't survive server restarts anyway
  const fallback = `local-dev-${process.env.HOSTNAME || "agentstudio"}`;
  return createHash("sha256").update(fallback).digest();
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
  const parts = ciphertext.split(":");

  if (parts.length !== 3) {
    throw new Error("Invalid encrypted key format");
  }

  const [ivHex, authTagHex, encrypted] = parts;
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
  return key.substring(0, 8) + "****" + key.substring(key.length - 4);
}
