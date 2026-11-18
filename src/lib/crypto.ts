import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET;
  if (!secret || secret.trim().length < 32) {
    throw new Error(
      '[CRITICAL SECURITY EXCEPTION] ENCRYPTION_SECRET is not configured or is shorter than 32 characters in environment variables. Refusing to operate with an insecure or missing key.'
    );
  }
  const salt = process.env.ENCRYPTION_SALT || 'a-coach-secure-cryptographic-salt-key-derivation';
  return crypto.scryptSync(secret, salt, 32);
}

/**
 * Encrypt a plain text string using AES-256-GCM.
 * Output format: iv:tag:ciphertext (hex encoded)
 */
export function encryptToken(text: string): string {
  if (!text) return '';
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt an AES-256-GCM encrypted token string.
 */
export function decryptToken(encryptedData: string): string {
  if (!encryptedData) return '';
  const parts = encryptedData.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted token format');
  }

  const iv = Buffer.from(parts[0], 'hex');
  const tag = Buffer.from(parts[1], 'hex');
  const ciphertext = parts[2];
  const key = getEncryptionKey();

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
