import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAuthorizationUrl, getStravaConfig } from '@/lib/strava';

export async function GET(request: NextRequest) {
  try {
    const { isConfigured } = getStravaConfig();
    if (!isConfigured) {
      return NextResponse.json(
        {
          error: 'STRAVA_NOT_CONFIGURED',
          message: 'STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET are not set in .env.local',
        },
        { status: 400 }
      );
    }

    // Generate random CSRF state
    const state = crypto.randomBytes(16).toString('hex');
    const authUrl = getAuthorizationUrl(state);

    const response = NextResponse.redirect(authUrl);
    // Set CSRF cookie for verification in callback
    response.cookies.set('strava_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
      path: '/',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: 'AUTHORIZE_ERROR', message: error.message },
      { status: 500 }
    );
  }
}
