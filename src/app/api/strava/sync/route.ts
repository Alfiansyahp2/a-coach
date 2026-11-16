import { NextRequest, NextResponse } from 'next/server';
import {
  getStravaConnection,
  getLatestActivityDate,
  getLastSyncLog,
  upsertActivity,
  createSyncLog,
  getActivities,
} from '@/lib/db';
import { fetchAthleteActivities, getValidAccessToken } from '@/lib/strava';
import { runAutoMatch } from '@/lib/domain/matching/matchingEngine';
import { Activity } from '@/types';
import { verifyUserAuthorization } from '@/lib/auth/authGuard';

/**
 * GET /api/strava/sync
 * Returns sync telemetry: last sync log, latest activity timestamp, total activities
 */
export async function GET(req: NextRequest) {
  try {
    const auth = verifyUserAuthorization(req);
    if (!auth.authorized) return auth.response!;
    const userId = auth.userId;

    const connection = await getStravaConnection(userId);
    const lastSync = await getLastSyncLog(userId);
    const latestActivityDate = await getLatestActivityDate(userId);
    const allActivities = await getActivities(userId, { limit: 1 });

    return NextResponse.json({
      isConnected: Boolean(connection && connection.is_active),
      lastSync,
      latestActivityDate,
      hasActivities: allActivities.length > 0,
    });
  } catch (err: any) {
    console.error('Error fetching sync telemetry:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve sync status', message: err.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/strava/sync
 * Triggers incremental activity sync from Strava API v3,
 * runs auto-matching, and logs execution to sync_logs table.
 */
export async function POST(req: NextRequest) {
  const auth = verifyUserAuthorization(req);
  if (!auth.authorized) return auth.response!;
  const userId = auth.userId;
  const startedAt = new Date().toISOString();

  // 1. Verify Strava connection
  const connection = await getStravaConnection(userId);
  if (!connection || !connection.is_active) {
    return NextResponse.json(
      {
        success: false,
        status: 'CONFIG_MISSING',
        message: 'No active Strava connection found. Please connect your Strava account first.',
      },
      { status: 400 }
    );
  }

  try {
    // 2. Obtain valid access token (auto-refreshes if < 5m remaining)
    const accessToken = await getValidAccessToken(connection.id);

    // 3. Determine incremental sync timestamp
    const latestDateStr = await getLatestActivityDate(userId);
    let afterTimestamp: number;

    if (latestDateStr) {
      // Ingest activities after the latest recorded date
      afterTimestamp = Math.floor(new Date(latestDateStr).getTime() / 1000);
    } else {
      // Default initial window: last 30 days
      afterTimestamp = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000);
    }

    // 4. Fetch activities from Strava API v3
    const { activities: rawActivities, rateLimit } = await fetchAthleteActivities(accessToken, {
      afterTimestamp,
      perPage: 100,
    });

    // 5. Ingest and upsert activities
    let createdCount = 0;
    let updatedCount = 0;
    const ingestedActivities: Activity[] = [];

    for (const item of rawActivities) {
      const activityPayload: Omit<Activity, 'id' | 'created_at' | 'updated_at'> = {
        user_id: connection.user_id,
        strava_activity_id: item.id,
        name: item.name || 'Untitled Activity',
        sport_type: item.sport_type || item.type || 'Run',
        start_date: item.start_date,
        distance_meters: Number(item.distance || 0),
        moving_time_seconds: Number(item.moving_time || 0),
        elapsed_time_seconds: Number(item.elapsed_time || 0),
        elevation_gain_meters: Number(item.total_elevation_gain || 0),
        average_speed_mps: Number(item.average_speed || 0),
        max_speed_mps: item.max_speed ? Number(item.max_speed) : undefined,
        average_heartrate: item.average_heartrate ? Number(item.average_heartrate) : null,
        max_heartrate: item.max_heartrate ? Number(item.max_heartrate) : null,
        average_cadence: item.average_cadence ? Number(item.average_cadence) : null,
        average_watts: item.average_watts ? Number(item.average_watts) : null,
        calories: item.calories || (item.kilojoules ? Math.round(item.kilojoules * 0.239) : null),
        raw_summary_polyline: item.map?.summary_polyline || null,
        description: item.description || null,
      };

      const { activity, isCreated } = await upsertActivity(activityPayload);
      if (isCreated) {
        createdCount++;
      } else {
        updatedCount++;
      }
      ingestedActivities.push(activity);
    }

    // 6. Execute auto-matching for newly ingested activities against planned workouts
    let matchedCount = 0;
    if (ingestedActivities.length > 0) {
      matchedCount = await runAutoMatch(connection.user_id, ingestedActivities);
    }

    // 7. Record successful audit entry in sync_logs
    const syncLog = await createSyncLog({
      user_id: connection.user_id,
      status: 'SUCCESS',
      activities_fetched: rawActivities.length,
      activities_created: createdCount,
      activities_updated: updatedCount,
      started_at: startedAt,
      completed_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      status: 'SUCCESS',
      fetched: rawActivities.length,
      created: createdCount,
      updated: updatedCount,
      matched: matchedCount,
      syncLogId: syncLog.id,
      rateLimit,
    });
  } catch (err: any) {
    console.error('Strava activity sync failed:', err);

    const isRateLimit = err.message?.includes('Rate Limit') || err.message?.includes('429');
    const status = isRateLimit ? 'RATE_LIMITED' : 'FAILED';

    await createSyncLog({
      user_id: connection.user_id,
      status,
      activities_fetched: 0,
      activities_created: 0,
      activities_updated: 0,
      error_message: err.message,
      started_at: startedAt,
      completed_at: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: false,
        status,
        message: isRateLimit
          ? 'Strava API rate limit reached (100 req / 15 min). Please try again shortly.'
          : err.message || 'Activity synchronization failed',
      },
      { status: isRateLimit ? 429 : 500 }
    );
  }
}

