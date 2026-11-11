import { pgPool, ensureLocalStore, saveLocalStore, DEFAULT_USER_ID, formatDateOnly } from '../client';
import { Activity, ScheduledWorkout, WorkoutActivityMatch, AthleteTrainingResponse } from '@/types';
import { upsertAthleteTrainingResponse } from '../healthRepo';
import { normalizeActivityRow, UpsertActivityResult, CreateManualActivityParams } from './activityTypes';
import { getActivityById } from './activityQueryRepo';
import { correlateManualActivityWithWorkout } from './activityWorkoutCorrelator';

export async function updateActivity(
  id: string,
  userId: string = DEFAULT_USER_ID,
  updates: {
    name?: string;
    sport_type?: string;
    start_date?: string;
    description?: string;
    distance_meters?: number;
    moving_time_seconds?: number;
    elevation_gain_meters?: number;
  }
): Promise<Activity | null> {
  const current = await getActivityById(id, userId);
  if (!current) return null;

  const newDistance = updates.distance_meters !== undefined ? updates.distance_meters : current.distance_meters;
  const newMovingTime = updates.moving_time_seconds !== undefined ? updates.moving_time_seconds : current.moving_time_seconds;
  const newSpeedMps = newMovingTime > 0 ? Math.round((newDistance / newMovingTime) * 1000) / 1000 : current.average_speed_mps;

  if (pgPool) {
    const res = await pgPool.query(
      `UPDATE activities 
       SET 
         name = COALESCE($1, name),
         sport_type = COALESCE($2, sport_type),
         start_date = COALESCE($3, start_date),
         description = COALESCE($4, description),
         distance_meters = COALESCE($5, distance_meters),
         moving_time_seconds = COALESCE($6, moving_time_seconds),
         elevation_gain_meters = COALESCE($7, elevation_gain_meters),
         average_speed_mps = $8,
         updated_at = NOW()
       WHERE id = $9 AND user_id = $10
       RETURNING *`,
      [
        updates.name !== undefined ? updates.name : null,
        updates.sport_type !== undefined ? updates.sport_type : null,
        updates.start_date !== undefined ? updates.start_date : null,
        updates.description !== undefined ? updates.description : null,
        updates.distance_meters !== undefined ? updates.distance_meters : null,
        updates.moving_time_seconds !== undefined ? updates.moving_time_seconds : null,
        updates.elevation_gain_meters !== undefined ? updates.elevation_gain_meters : null,
        newSpeedMps,
        id,
        userId,
      ]
    );
    if (!res.rows[0]) return null;
    return normalizeActivityRow(res.rows[0]);
  }

  const store = ensureLocalStore();
  const act = store.activities.find((a) => a.id === id && a.user_id === userId);
  if (!act) return null;

  if (updates.name !== undefined) act.name = updates.name;
  if (updates.sport_type !== undefined) act.sport_type = updates.sport_type;
  if (updates.start_date !== undefined) act.start_date = updates.start_date;
  if (updates.description !== undefined) act.description = updates.description;
  if (updates.distance_meters !== undefined) act.distance_meters = updates.distance_meters;
  if (updates.moving_time_seconds !== undefined) act.moving_time_seconds = updates.moving_time_seconds;
  if (updates.elevation_gain_meters !== undefined) act.elevation_gain_meters = updates.elevation_gain_meters;
  act.average_speed_mps = newSpeedMps;
  act.updated_at = new Date().toISOString();

  saveLocalStore(store);
  return normalizeActivityRow(act);
}

export async function deleteActivity(
  id: string,
  userId: string = DEFAULT_USER_ID
): Promise<boolean> {
  if (pgPool) {
    // 1. Find any matched workouts before deleting
    const matchRes = await pgPool.query(
      `SELECT workout_id FROM workout_activity_matches WHERE activity_id = $1`,
      [id]
    );
    const matchedWorkoutIds = matchRes.rows.map((r) => r.workout_id);

    // 2. Delete the activity
    const res = await pgPool.query(
      `DELETE FROM activities WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, userId]
    );
    if (!res.rows[0]) return false;

    // 3. For any previously matched workouts, check if they have other matches; if not, revert to PLANNED
    for (const wId of matchedWorkoutIds) {
      const remainingMatches = await pgPool.query(
        `SELECT COUNT(*) FROM workout_activity_matches WHERE workout_id = $1`,
        [wId]
      );
      if (parseInt(remainingMatches.rows[0].count, 10) === 0) {
        await pgPool.query(
          `UPDATE scheduled_workouts SET status = 'PLANNED', updated_at = NOW() WHERE id = $1 AND user_id = $2`,
          [wId, userId]
        );
      }
    }
    return true;
  }

  const store = ensureLocalStore();
  const initialLen = store.activities.length;
  store.activities = store.activities.filter((a) => !(a.id === id && a.user_id === userId));
  if (store.activities.length === initialLen) return false;

  // Cleanup matches in local store
  const matchedWorkouts = store.workout_activity_matches
    .filter((m) => m.activity_id === id)
    .map((m) => m.workout_id);
  store.workout_activity_matches = store.workout_activity_matches.filter((m) => m.activity_id !== id);

  for (const wId of matchedWorkouts) {
    const hasOtherMatches = store.workout_activity_matches.some((m) => m.workout_id === wId);
    if (!hasOtherMatches) {
      const w = store.scheduled_workouts.find((sw) => sw.id === wId && sw.user_id === userId);
      if (w) w.status = 'PLANNED';
    }
  }

  saveLocalStore(store);
  return true;
}

export async function batchUpdateActivities(
  ids: string[],
  updates: { sport_type?: string },
  userId: string = DEFAULT_USER_ID
): Promise<number> {
  if (ids.length === 0) return 0;
  if (pgPool) {
    const res = await pgPool.query(
      `UPDATE activities SET
        sport_type = COALESCE($1, sport_type),
        updated_at = NOW()
      WHERE id = ANY($2::uuid[]) AND user_id = $3
      RETURNING id`,
      [updates.sport_type || null, ids, userId]
    );
    return res.rowCount || 0;
  }

  const store = ensureLocalStore();
  let count = 0;
  for (const act of store.activities) {
    if (ids.includes(act.id) && act.user_id === userId) {
      if (updates.sport_type) act.sport_type = updates.sport_type as any;
      act.updated_at = new Date().toISOString();
      count++;
    }
  }
  saveLocalStore(store);
  return count;
}

export async function upsertActivity(
  activity: Omit<Activity, 'id' | 'created_at' | 'updated_at'>
): Promise<UpsertActivityResult> {
  const now = new Date().toISOString();
  const isManual = activity.is_manual ?? (activity.strava_activity_id ? false : true);
  if (pgPool) {
    const query = `
      INSERT INTO activities (
        user_id, strava_activity_id, is_manual, name, sport_type, start_date, distance_meters,
        moving_time_seconds, elapsed_time_seconds, elevation_gain_meters, average_speed_mps,
        max_speed_mps, average_heartrate, max_heartrate, average_cadence, average_watts,
        calories, raw_summary_polyline, description, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW())
      ON CONFLICT (strava_activity_id) DO UPDATE SET
        name = EXCLUDED.name,
        sport_type = EXCLUDED.sport_type,
        start_date = EXCLUDED.start_date,
        distance_meters = EXCLUDED.distance_meters,
        moving_time_seconds = EXCLUDED.moving_time_seconds,
        elapsed_time_seconds = EXCLUDED.elapsed_time_seconds,
        elevation_gain_meters = EXCLUDED.elevation_gain_meters,
        average_speed_mps = EXCLUDED.average_speed_mps,
        max_speed_mps = EXCLUDED.max_speed_mps,
        average_heartrate = EXCLUDED.average_heartrate,
        max_heartrate = EXCLUDED.max_heartrate,
        average_cadence = EXCLUDED.average_cadence,
        average_watts = EXCLUDED.average_watts,
        calories = EXCLUDED.calories,
        description = EXCLUDED.description,
        is_manual = EXCLUDED.is_manual,
        updated_at = NOW()
      RETURNING *, (xmax = 0) AS is_created;
    `;
    const res = await pgPool.query(query, [
      activity.user_id,
      activity.strava_activity_id || null,
      isManual,
      activity.name,
      activity.sport_type,
      activity.start_date,
      activity.distance_meters,
      activity.moving_time_seconds,
      activity.elapsed_time_seconds,
      activity.elevation_gain_meters,
      activity.average_speed_mps,
      activity.max_speed_mps || null,
      activity.average_heartrate || null,
      activity.max_heartrate || null,
      activity.average_cadence || null,
      activity.average_watts || null,
      activity.calories || null,
      activity.raw_summary_polyline || null,
      activity.description || null,
    ]);
    const row = res.rows[0];
    return {
      activity: normalizeActivityRow(row),
      isCreated: Boolean(row.is_created),
    };
  }

  const store = ensureLocalStore();
  const existingIdx = activity.strava_activity_id
    ? store.activities.findIndex((a) => a.strava_activity_id === activity.strava_activity_id)
    : -1;
  const isCreated = existingIdx < 0;
  const act: Activity = {
    ...activity,
    strava_activity_id: activity.strava_activity_id ?? null,
    is_manual: isManual,
    id: existingIdx >= 0 ? store.activities[existingIdx].id : crypto.randomUUID(),
    created_at: existingIdx >= 0 ? store.activities[existingIdx].created_at : now,
    updated_at: now,
  };

  if (existingIdx >= 0) {
    store.activities[existingIdx] = act;
  } else {
    store.activities.push(act);
  }
  saveLocalStore(store);
  return {
    activity: normalizeActivityRow(act),
    isCreated,
  };
}

export { createManualActivity } from './manualActivityRepo';


