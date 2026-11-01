import { decryptToken, encryptToken } from './crypto';
import { getStravaToken, saveStravaTokens } from './db';

const STRAVA_AUTH_URL = 'https://www.strava.com/oauth/authorize';
const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token';
const STRAVA_API_BASE = 'https://www.strava.com/api/v3';

export interface StravaConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  isConfigured: boolean;
}

export function getStravaConfig(): StravaConfig {
  const clientId = process.env.STRAVA_CLIENT_ID || '';
  const clientSecret = process.env.STRAVA_CLIENT_SECRET || '';
  const redirectUri = process.env.STRAVA_REDIRECT_URI || 'http://localhost:3000/api/auth/strava/callback';

  return {
    clientId,
    clientSecret,
    redirectUri,
    isConfigured: Boolean(clientId && clientSecret),
  };
}

/**
 * Generate Strava OAuth Authorization URL
 */
export function getAuthorizationUrl(state: string): string {
  const { clientId, redirectUri, isConfigured } = getStravaConfig();
  if (!isConfigured) {
    throw new Error('STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET must be set in .env.local');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    approval_prompt: 'auto',
    scope: 'read,activity:read_all',
    state,
  });

  return `${STRAVA_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange Authorization Code for Access & Refresh Tokens
 */
export async function exchangeAuthorizationCode(code: string) {
  const { clientId, clientSecret, isConfigured } = getStravaConfig();
  if (!isConfigured) {
    throw new Error('Strava credentials missing');
  }

  const response = await fetch(STRAVA_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to exchange code with Strava: ${response.status} ${errorText}`);
  }

  return response.json();
}

/**
 * Ensure valid access token. Refreshes automatically if expired or expiring within 5 minutes.
 */
export async function getValidAccessToken(connectionId: string): Promise<string> {
  const tokenRecord = await getStravaToken(connectionId);
  if (!tokenRecord) {
    throw new Error('No Strava token record found for connection');
  }

  const expiresAtMs = new Date(tokenRecord.expires_at).getTime();
  const nowMs = Date.now();
  const fiveMinutesMs = 5 * 60 * 1000;

  // If token is still valid for > 5 minutes, decrypt and return
  if (expiresAtMs - nowMs > fiveMinutesMs) {
    return decryptToken(tokenRecord.access_token_encrypted);
  }

  // Token is expired or expiring soon -> Refresh it
  const { clientId, clientSecret } = getStravaConfig();
  const refreshToken = decryptToken(tokenRecord.refresh_token_encrypted);

  const response = await fetch(STRAVA_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to refresh Strava token: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const newExpiresAt = new Date(data.expires_at * 1000).toISOString();

  await saveStravaTokens(
    connectionId,
    encryptToken(data.access_token),
    encryptToken(data.refresh_token),
    newExpiresAt
  );

  return data.access_token;
}

/**
 * Fetch authenticated athlete's activities incrementally.
 * Respects Strava rate limits and paging (max 100 per page).
 */
export async function fetchAthleteActivities(
  accessToken: string,
  options?: { afterTimestamp?: number; page?: number; perPage?: number }
) {
  const page = options?.page || 1;
  const perPage = Math.min(options?.perPage || 100, 100);

  const url = new URL(`${STRAVA_API_BASE}/athlete/activities`);
  url.searchParams.set('page', page.toString());
  url.searchParams.set('per_page', perPage.toString());

  if (options?.afterTimestamp) {
    url.searchParams.set('after', options.afterTimestamp.toString());
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const rateLimitLimit = response.headers.get('x-ratelimit-limit');
  const rateLimitUsage = response.headers.get('x-ratelimit-usage');

  if (response.status === 429) {
    throw new Error(`Strava API Rate Limit exceeded (Usage: ${rateLimitUsage}, Limit: ${rateLimitLimit})`);
  }

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to fetch activities from Strava: ${response.status} ${err}`);
  }

  const activities = await response.json();
  return {
    activities,
    rateLimit: {
      limit: rateLimitLimit,
      usage: rateLimitUsage,
    },
  };
}

/**
 * Deauthorize and revoke access token with Strava
 */
export async function deauthorizeStrava(accessToken: string): Promise<boolean> {
  try {
    const res = await fetch(`${STRAVA_API_BASE}/oauth/deauthorize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to call Strava deauthorize:', err);
    return false;
  }
}
