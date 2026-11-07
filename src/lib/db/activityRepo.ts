import { pgPool, ensureLocalStore, saveLocalStore, DEFAULT_USER_ID, formatDateOnly } from './client';
import { Activity, ScheduledWorkout, WorkoutActivityMatch, AthleteTrainingResponse } from '@/types';
import { getScheduledWorkouts, updateScheduledWorkout, saveWorkoutActivityMatch } from './trainingRepo';
import { upsertAthleteTrainingResponse } from './healthRepo';

export function normalizeActivityRow(row: any): Activity {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    strava_activity_id: row.strava_activity_id != null ? Number(row.strava_activity_id) : null,
    is_manual: row.is_manual != null ? Boolean(row.is_manual) : (row.strava_activity_id == null),
    name: String(row.name || ''),
    sport_type: String(row.sport_type || 'Run'),
    start_date:
      row.start_date instanceof Date
        ? row.start_date.toISOString()
        : typeof row.start_date === 'string'
          ? row.start_date
          : String(row.start_date || ''),
    distance_meters: Number(row.distance_meters || 0),
    moving_time_seconds: Number(row.moving_time_seconds || 0),
    elapsed_time_seconds: Number(row.elapsed_time_seconds || 0),
    elevation_gain_meters: Number(row.elevation_gain_meters || 0),
    average_speed_mps: Number(row.average_speed_mps || 0),
    max_speed_mps: row.max_speed_mps != null ? Number(row.max_speed_mps) : undefined,
    average_heartrate: row.average_heartrate != null ? Number(row.average_heartrate) : null,
    max_heartrate: row.max_heartrate != null ? Number(row.max_heartrate) : null,
    average_cadence: row.average_cadence != null ? Number(row.average_cadence) : null,
    average_watts: row.average_watts != null ? Number(row.average_watts) : null,
    calories: row.calories != null ? Number(row.calories) : null,
    raw_summary_polyline: row.raw_summary_polyline || null,
    description: row.description || null,
    created_at:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : typeof row.created_at === 'string'
          ? row.created_at
          : String(row.created_at || ''),
    updated_at:
      row.updated_at instanceof Date
        ? row.updated_at.toISOString()
        : typeof row.updated_at === 'string'
          ? row.updated_at
          : String(row.updated_at || ''),
  };
}

export async function getActivityById(
  id: string,
  userId: string = DEFAULT_USER_ID
): Promise<Activity | null> {
  if (pgPool) {
    const res = await pgPool.query(
      'SELECT * FROM activities WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    if (!res.rows[0]) return null;
    return normalizeActivityRow(res.rows[0]);
  }

  const store = ensureLocalStore();
  const act = store.activities.find((a) => a.id === id && a.user_id === userId);
  return act ? normalizeActivityRow(act) : null;
}

export async function getAdjacentActivities(
  currentId: string,
  userId: string = DEFAULT_USER_ID
): Promise<{ prev: Activity | null; next: Activity | null }> {
  const all = await getActivities(userId);
  const idx = all.findIndex((a) => a.id === currentId);
  if (idx < 0) return { prev: null, next: null };
  return {
    prev: idx > 0 ? all[idx - 1] : null,
    next: idx < all.length - 1 ? all[idx + 1] : null,
  };
}

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

export async function getActivities(
  userId: string = DEFAULT_USER_ID,
  filters?: { sportType?: string; limit?: number; afterDate?: string }
): Promise<Activity[]> {
  if (pgPool) {
    let query = 'SELECT * FROM activities WHERE user_id = $1';
    const params: any[] = [userId];

    if (filters?.sportType && filters.sportType !== 'All') {
      params.push(filters.sportType);
      query += ` AND sport_type = $${params.length}`;
    }
    if (filters?.afterDate) {
      params.push(filters.afterDate);
      query += ` AND start_date >= $${params.length}`;
    }
    query += ' ORDER BY start_date DESC';
    if (filters?.limit) {
      params.push(filters.limit);
      query += ` LIMIT $${params.length}`;
    }
    const res = await pgPool.query(query, params);
    return res.rows.map(normalizeActivityRow);
  }

  const store = ensureLocalStore();
  let acts = store.activities.filter((a) => a.user_id === userId);
  if (filters?.sportType && filters.sportType !== 'All') {
    acts = acts.filter((a) => a.sport_type.toLowerCase() === filters.sportType?.toLowerCase());
  }
  if (filters?.afterDate) {
    const target = new Date(filters.afterDate).getTime();
    acts = acts.filter((a) => new Date(a.start_date).getTime() >= target);
  }
  acts.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
  if (filters?.limit) {
    acts = acts.slice(0, filters.limit);
  }
  return acts.map(normalizeActivityRow);
}

export interface UpsertActivityResult {
  activity: Activity;
  isCreated: boolean;
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

export interface CreateManualActivityParams {
  name: string;
  sport_type: string;
  start_date: string;
  distance_meters?: number;
  moving_time_seconds?: number;
  elapsed_time_seconds?: number;
  elevation_gain_meters?: number;
  average_speed_mps?: number;
  max_speed_mps?: number;
  average_heartrate?: number;
  max_heartrate?: number;
  average_cadence?: number;
  average_watts?: number;
  calories?: number;
  description?: string;
  workout_id?: string;
  // Clinical / Check-in responses
  rpe_score?: number | null;
  pain_during_activity?: number | null;
  pain_after_activity?: number | null;
  pain_next_day?: number | null;
  swelling_observed?: boolean | null;
  instability_observed?: boolean | null;
  athlete_comments?: string | null;
}

export async function createManualActivity(
  userId: string = DEFAULT_USER_ID,
  params: CreateManualActivityParams
): Promise<{
  activity: Activity;
  matchedWorkout: ScheduledWorkout | null;
  match: WorkoutActivityMatch | null;
  trainingResponse?: AthleteTrainingResponse | null;
}> {
  const distance_meters = Number(params.distance_meters || 0);
  const moving_time_seconds = Number(params.moving_time_seconds || 0);
  const elapsed_time_seconds = Number(params.elapsed_time_seconds || moving_time_seconds);
  const elevation_gain_meters = Number(params.elevation_gain_meters || 0);
  
  let average_speed_mps = params.average_speed_mps;
  if (!average_speed_mps && moving_time_seconds > 0 && distance_meters > 0) {
    average_speed_mps = Number((distance_meters / moving_time_seconds).toFixed(2));
  }

  const { activity } = await upsertActivity({
    user_id: userId,
    strava_activity_id: null,
    is_manual: true,
    name: params.name || 'Manual Workout Activity',
    sport_type: (params.sport_type || 'Ride') as any,
    start_date: params.start_date || new Date().toISOString(),
    distance_meters,
    moving_time_seconds,
    elapsed_time_seconds,
    elevation_gain_meters,
    average_speed_mps: average_speed_mps || 0,
    max_speed_mps: params.max_speed_mps !== undefined && params.max_speed_mps !== null ? params.max_speed_mps : undefined,
    average_heartrate: params.average_heartrate || null,
    max_heartrate: params.max_heartrate || null,
    average_cadence: params.average_cadence || null,
    average_watts: params.average_watts || null,
    calories: params.calories || null,
    description: params.description || null,
  });

  // Attempt workout correlation
  let matchedWorkout: ScheduledWorkout | null = null;
  let match: WorkoutActivityMatch | null = null;

  try {
    const workouts = await getScheduledWorkouts(userId);
    const activityDate = formatDateOnly(params.start_date);

    if (params.workout_id) {
      matchedWorkout = workouts.find((w) => w.id === params.workout_id) || null;
    } else {
      // Find matching planned or missed workout on the same day
      const candidateWorkouts = workouts.filter((w) => {
        const wDate = formatDateOnly(w.scheduled_date);
        return wDate === activityDate && (w.status === 'PLANNED' || w.status === 'MISSED');
      });

      if (candidateWorkouts.length > 0) {
        // Match by sport type if possible
        const normSport = (params.sport_type || '').toLowerCase();
        const sameSport = candidateWorkouts.find((w) => {
          const wCategory = (w.workout_category || '').toLowerCase();
          return (
            (normSport.includes('ride') && (wCategory.includes('ride') || wCategory.includes('cycl'))) ||
            (normSport.includes('run') && (wCategory.includes('run') || wCategory.includes('lari'))) ||
            wCategory === normSport
          );
        });
        matchedWorkout = sameSport || candidateWorkouts[0];
      }
    }

    if (matchedWorkout) {
      let completionPercentage = 100;
      if (matchedWorkout.target_distance_meters && matchedWorkout.target_distance_meters > 0) {
        completionPercentage = Math.min(200, Math.round((distance_meters / matchedWorkout.target_distance_meters) * 100));
      } else if (matchedWorkout.target_duration_seconds && matchedWorkout.target_duration_seconds > 0) {
        completionPercentage = Math.min(200, Math.round((moving_time_seconds / matchedWorkout.target_duration_seconds) * 100));
      }

      const distDelta = distance_meters - (matchedWorkout.target_distance_meters || 0);
      const durDelta = moving_time_seconds - (matchedWorkout.target_duration_seconds || 0);

      match = await saveWorkoutActivityMatch({
        workout_id: matchedWorkout.id,
        activity_id: activity.id,
        is_manual_match: true,
        completion_percentage: completionPercentage,
        distance_delta_meters: distDelta,
        duration_delta_seconds: durDelta,
        pace_delta_seconds_per_km: 0,
      });

      await updateScheduledWorkout(matchedWorkout.id, {
        status: 'COMPLETED',
      });
      matchedWorkout.status = 'COMPLETED';
    }
  } catch (matchErr) {
    console.warn('Failed to correlate workout with manual activity:', matchErr);
  }

  // Record athlete training response if check-in metrics provided
  let trainingResponse: AthleteTrainingResponse | null = null;
  if (
    params.rpe_score != null ||
    params.pain_during_activity != null ||
    params.pain_after_activity != null ||
    params.swelling_observed != null ||
    params.athlete_comments != null
  ) {
    try {
      trainingResponse = await upsertAthleteTrainingResponse({
        user_id: userId,
        activity_id: activity.id,
        strava_activity_id: null,
        sport_type: params.sport_type,
        distance_km: Number((distance_meters / 1000).toFixed(2)),
        duration_seconds: moving_time_seconds,
        rpe_score: params.rpe_score ?? null,
        pain_during_activity: params.pain_during_activity ?? 0,
        pain_after_activity: params.pain_after_activity ?? 0,
        pain_next_day: params.pain_next_day ?? null,
        swelling_observed: Boolean(params.swelling_observed),
        instability_observed: Boolean(params.instability_observed),
        fatigue_response: (params.rpe_score ?? 0) >= 8 ? 'HIGH' : (params.rpe_score ?? 0) >= 5 ? 'NORMAL' : 'LOW',
        athlete_comments: params.athlete_comments || params.description || null,
        checkin_completed_at: new Date().toISOString(),
      });
    } catch (respErr) {
      console.warn('Failed to save athlete training response:', respErr);
    }
  }

  return {
    activity,
    matchedWorkout,
    match,
    trainingResponse,
  };
}

export async function getLatestActivityDate(userId: string = DEFAULT_USER_ID): Promise<string | null> {
  if (pgPool) {
    const res = await pgPool.query('SELECT MAX(start_date) as max_date FROM activities WHERE user_id = $1', [userId]);
    const maxDate = res.rows[0]?.max_date;
    if (!maxDate) return null;
    return maxDate instanceof Date ? maxDate.toISOString() : String(maxDate);
  }

  const store = ensureLocalStore();
  const acts = store.activities.filter((a) => a.user_id === userId);
  if (acts.length === 0) return null;
  const sorted = [...acts].sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
  return sorted[0].start_date;
}
