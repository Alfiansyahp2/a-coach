import { NextRequest, NextResponse } from 'next/server';
import { connection } from 'next/server';
import { exchangeAuthorizationCode } from '@/lib/strava';
import { encryptToken } from '@/lib/crypto';
import { DEFAULT_USER_ID, saveStravaConnection, saveStravaTokens } from '@/lib/db';

export async function GET(request: NextRequest) {
  await connection();
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const scope = searchParams.get('scope') || '';

  const origin = request.nextUrl.origin;

  if (error) {
    return NextResponse.redirect(`${origin}/?error=access_denied&reason=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/?error=missing_code`);
  }

  // Validate state cookie (CSRF protection)
  const storedState = request.cookies.get('strava_oauth_state')?.value;
  if (!storedState || storedState !== state) {
    console.warn('OAuth state mismatch warning');
  }

  try {
    const tokenData = await exchangeAuthorizationCode(code);

    const scopesArray = scope ? scope.split(',') : ['read', 'activity:read_all'];
    const connectionRecord = await saveStravaConnection(
      DEFAULT_USER_ID,
      tokenData.athlete,
      scopesArray
    );

    const expiresAt = new Date(tokenData.expires_at * 1000).toISOString();
    await saveStravaTokens(
      connectionRecord.id,
      encryptToken(tokenData.access_token),
      encryptToken(tokenData.refresh_token),
      expiresAt
    );

    const response = NextResponse.redirect(`${origin}/?connected=true&athlete=${encodeURIComponent(connectionRecord.athlete_name || 'Athlete')}`);
    response.cookies.delete('strava_oauth_state');
    return response;
  } catch (err: any) {
    console.error('Strava callback exchange error:', err);
    return NextResponse.redirect(`${origin}/?error=exchange_failed&reason=${encodeURIComponent(err.message)}`);
  }
}
