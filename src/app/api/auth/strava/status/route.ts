import { NextResponse } from 'next/server';
import { getStravaConfig } from '@/lib/strava';
import { DEFAULT_USER_ID, getStravaConnection } from '@/lib/db';

export async function GET() {
  try {
    const config = getStravaConfig();

    if (!config.isConfigured) {
      return NextResponse.json({
        isConfigured: false,
        isConnected: false,
        athlete: null,
        message: 'STRAVA_CLIENT_ID or STRAVA_CLIENT_SECRET is missing in .env.local',
      });
    }

    const connection = await getStravaConnection(DEFAULT_USER_ID);

    if (!connection || !connection.is_active) {
      return NextResponse.json({
        isConfigured: true,
        isConnected: false,
        athlete: null,
      });
    }

    return NextResponse.json({
      isConfigured: true,
      isConnected: true,
      athlete: {
        id: connection.strava_athlete_id,
        name: connection.athlete_name || 'Strava Athlete',
        username: connection.athlete_username || null,
        avatar: connection.avatar_url || null,
        scopes: connection.scopes || [],
        connectedAt: connection.created_at,
        updatedAt: connection.updated_at,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'STATUS_CHECK_FAILED', message: error.message },
      { status: 500 }
    );
  }
}

