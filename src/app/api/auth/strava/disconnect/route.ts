import { NextRequest, NextResponse } from 'next/server';
import { disconnectStrava, getStravaConnection } from '@/lib/db';
import { deauthorizeStrava, getValidAccessToken } from '@/lib/strava';
import { verifyUserAuthorization } from '@/lib/auth/authGuard';

export async function POST(req: NextRequest) {
  try {
    const auth = verifyUserAuthorization(req);
    if (!auth.authorized) return auth.response!;
    const userId = auth.userId;

    const connection = await getStravaConnection(userId);

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
    await disconnectStrava(userId);

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
