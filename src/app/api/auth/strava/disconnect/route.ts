import { NextResponse } from 'next/server';
import { DEFAULT_USER_ID, disconnectStrava, getStravaConnection } from '@/lib/db';
import { deauthorizeStrava, getValidAccessToken } from '@/lib/strava';

export async function POST() {
  try {
    const connection = await getStravaConnection(DEFAULT_USER_ID);

    if (!connection) {
      return NextResponse.json(
        { error: 'NO_ACTIVE_CONNECTION', message: 'No active Strava connection found' },
        { status: 404 }
      );
    }

    // Attempt remote revocation on Strava API (fail-soft if already expired or network issue)
    try {
      const accessToken = await getValidAccessToken(connection.id);
      if (accessToken) {
        await deauthorizeStrava(accessToken);
      }
    } catch (revokeErr) {
      console.warn('Remote Strava deauthorization warning:', revokeErr);
    }

    // Purge local connection and tokens
    await disconnectStrava(DEFAULT_USER_ID);

    return NextResponse.json({
      success: true,
      message: 'Strava connection disconnected and revoked successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'DISCONNECT_FAILED', message: error.message },
      { status: 500 }
    );
  }
}

