import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { DEFAULT_USER_ID } from '@/lib/db/client';

export const SESSION_COOKIE_NAME = 'a_coach_session';

/**
 * Generates an HMAC-SHA256 signature for a given user ID to protect against tampering.
 */
function getSigningSecret(): string {
  return process.env.ENCRYPTION_SECRET || 'a-coach-session-secret-hmac-key-v1';
}

export function signSessionToken(userId: string): string {
  const secret = getSigningSecret();
  const signature = crypto.createHmac('sha256', secret).update(userId).digest('hex');
  return `${userId}.${signature}`;
}

export function verifySessionToken(token: string): string | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [userId, providedSig] = parts;
  const secret = getSigningSecret();
  const expectedSig = crypto.createHmac('sha256', secret).update(userId).digest('hex');

  // Constant-time comparison to prevent timing attacks
  const providedBuffer = Buffer.from(providedSig, 'hex');
  const expectedBuffer = Buffer.from(expectedSig, 'hex');

  if (providedBuffer.length !== expectedBuffer.length) return null;
  if (!crypto.timingSafeEqual(providedBuffer, expectedBuffer)) return null;

  return userId;
}

/**
 * Resolves the authenticated session user ID from the request.
 * Checks session cookies, authorization headers, and internal identity.
 */
export function resolveSessionUser(req: Request | NextRequest): string {
  let cookieHeader = '';
  let authHeader: string | null = null;
  let customHeader: string | null = null;

  if ('cookies' in req && typeof (req as any).cookies?.get === 'function') {
    const sessionCookie = (req as NextRequest).cookies.get(SESSION_COOKIE_NAME);
    if (sessionCookie?.value) {
      const verified = verifySessionToken(sessionCookie.value);
      if (verified) return verified;
    }
  }

  // Fallback to headers
  if (req.headers) {
    if (typeof req.headers.get === 'function') {
      authHeader = req.headers.get('authorization');
      customHeader = req.headers.get('x-user-id');
      cookieHeader = req.headers.get('cookie') || '';
    }
  }

  // Parse Cookie header manually if not already parsed
  if (cookieHeader) {
    const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`));
    if (match && match[1]) {
      const verified = verifySessionToken(decodeURIComponent(match[1]));
      if (verified) return verified;
    }
  }

  // Authorization: Bearer <signed-token>
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const verified = verifySessionToken(token);
    if (verified) return verified;
  }

  // If x-user-id is supplied, ensure it matches the authorized owner
  if (customHeader && customHeader === DEFAULT_USER_ID) {
    return DEFAULT_USER_ID;
  }

  // Single-user self-hosted default identity (Altra)
  return DEFAULT_USER_ID;
}

export interface AuthValidationResult {
  authorized: boolean;
  userId: string;
  response?: NextResponse;
}

/**
 * Enforces Broken Object Level Authorization (BOLA) safeguards (Finding F-P2-05).
 * Validates that the requested target athlete matches the authenticated session user.
 */
export function verifyUserAuthorization(
  req: Request | NextRequest,
  requestedUserId?: string | null
): AuthValidationResult {
  const authenticatedUserId = resolveSessionUser(req);

  // If a specific target athlete ID is requested via query, body, or params
  if (requestedUserId && requestedUserId.trim() !== '') {
    const normalizedTarget = requestedUserId.trim();
    if (normalizedTarget !== authenticatedUserId) {
      console.warn(`[BOLA_DEFENSE] Blocked unauthorized attempt to access user ${normalizedTarget} by session ${authenticatedUserId}`);
      return {
        authorized: false,
        userId: authenticatedUserId,
        response: NextResponse.json(
          {
            success: false,
            error: 'Forbidden: Broken Object Level Authorization (BOLA) violation',
            message: 'Akses ditolak: Anda tidak memiliki wewenang untuk melihat atau memodifikasi data atlet lain.',
            code: 'BOLA_VIOLATION',
          },
          { status: 403 }
        ),
      };
    }
  }

  return {
    authorized: true,
    userId: authenticatedUserId,
  };
}

