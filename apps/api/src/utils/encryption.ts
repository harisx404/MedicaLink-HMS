import crypto from 'crypto';
import { env } from '../config/env';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;

/**
 * Encrypts a string using AES-256-GCM.
 * Compatible with OWASP A02: Cryptographic Failures.
 * Format: base64(iv:salt:encryptedData:authTag)
 */
export function encrypt(text: string): string {
  if (!text) return text;
  if (!env.ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY is required for encryption');
  }

  // Generate unique IV and salt for this specific encryption
  const iv = crypto.randomBytes(IV_LENGTH);
  const salt = crypto.randomBytes(SALT_LENGTH);

  // Derive key using PBKDF2 to prevent rainbow table attacks if key was weak
  const key = crypto.pbkdf2Sync(env.ENCRYPTION_KEY, salt, 100000, 32, 'sha512');

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  // Return a single combined base64 string
  return Buffer.concat([iv, salt, encrypted, tag]).toString('base64');
}

/**
 * Decrypts a string encrypted by `encrypt`.
 */
export function decrypt(encryptedData: string): string {
  if (!encryptedData) return encryptedData;
  if (!env.ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY is required for decryption');
  }

  try {
    const data = Buffer.from(encryptedData, 'base64');

    // Extract components
    const iv = data.subarray(0, IV_LENGTH);
    const salt = data.subarray(IV_LENGTH, IV_LENGTH + SALT_LENGTH);
    const tag = data.subarray(data.length - TAG_LENGTH);
    const encrypted = data.subarray(IV_LENGTH + SALT_LENGTH, data.length - TAG_LENGTH);

    // Derive the exact key used during encryption
    const key = crypto.pbkdf2Sync(env.ENCRYPTION_KEY, salt, 100000, 32, 'sha512');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    const decrypted = decipher.update(encrypted) + decipher.final('utf8');
    return decrypted;
  } catch (error) {
    throw new Error('Decryption failed. The data may be corrupted or the encryption key is invalid.');
  }
}
