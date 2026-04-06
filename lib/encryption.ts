// lib/encryption.ts - Simple AES encryption for sensitive data
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

// Encryption key from environment (must be 32 bytes for AES-256)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

// In production, throw an error if the key is missing
if (!ENCRYPTION_KEY && process.env.NODE_ENV === 'production') {
  throw new Error(
    'ENCRYPTION_KEY environment variable is required in production. ' +
    'Generate a secure key with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
  );
}

// Fallback for development only - never used in production
const DEV_KEY = ENCRYPTION_KEY || 'dev-key-do-not-use-in-production-change-me!';
const IV_LENGTH = 16; // AES block size

function getKey(): Buffer {
  // Derive a 32-byte key from the environment variable
  return scryptSync(DEV_KEY, 'salt', 32);
}

/**
 * Encrypt a string using AES-256-CBC
 * Returns base64 encoded string: iv:encryptedText
 */
export function encrypt(text: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv('aes-256-cbc', getKey(), iv);
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return `${iv.toString('base64')}:${encrypted}`;
}

/**
 * Decrypt a string that was encrypted with encrypt()
 * Expects base64 encoded string: iv:encryptedText
 */
export function decrypt(encryptedText: string): string {
  const [ivBase64, encrypted] = encryptedText.split(':');
  if (!ivBase64 || !encrypted) {
    throw new Error('Invalid encrypted text format');
  }
  const iv = Buffer.from(ivBase64, 'base64');
  const decipher = createDecipheriv('aes-256-cbc', getKey(), iv);
  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
