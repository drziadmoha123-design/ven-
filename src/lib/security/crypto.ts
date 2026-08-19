import * as argon2 from "argon2";
import crypto from "crypto";

export const ARGON2_CONFIG: argon2.HashOptions = {
  type: argon2.argon2id,
  memoryCost: 65536, // 64 MB
  timeCost: 3,       // 3 iterations
  parallelism: 4,    // 4 threads
};

/**
 * Hashes a plaintext password using Argon2id with production security parameters
 */
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, ARGON2_CONFIG);
}

/**
 * Verifies a plaintext password against an Argon2id hash.
 * Resistant to timing attacks.
 */
export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, plain);
  } catch {
    return false;
  }
}

/**
 * Generates a cryptographically secure random token (hex string)
 */
export function generateSecureToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

/**
 * Computes a SHA-256 hash of a token for storage in DB
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Generates a unique, human-friendly uppercase referral code (e.g. VEN8K9X2)
 */
export function generateReferralCode(length: number = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Exclude ambiguous chars like 0, O, 1, I
  let result = "VEN";
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length - 3; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}
