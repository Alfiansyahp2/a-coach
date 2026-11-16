import { pgPool, ensureLocalStore, saveLocalStore, DEFAULT_USER_ID } from './client';
import { WorkoutActivityMatch } from '@/types';
import { normalizeActivityRow } from './activityRepo';

export async function getWorkoutActivityMatches(userId: string = DEFAULT_USER_ID): Promise<WorkoutActivityMatch[]> {
  if (pgPool) {
    const query = `
      SELECT m.*, 
        row_to_json(w.*) as workout,
        row_to_json(a.*) as activity
      FROM workout_activity_matches m
      JOIN scheduled_workouts w ON m.workout_id = w.id
      JOIN activities a ON m.activity_id = a.id
      WHERE w.user_id = $1
      ORDER BY m.matched_at DESC;
    `;
    const res = await pgPool.query(query, [userId]);
    return res.rows.map((row) => ({
      ...row,
      completion_percentage: Number(row.completion_percentage || 0),
      distance_delta_meters: Number(row.distance_delta_meters || 0),
      duration_delta_seconds: Number(row.duration_delta_seconds || 0),
      pace_delta_seconds_per_km: Number(row.pace_delta_seconds_per_km || 0),
      matched_at:
        row.matched_at instanceof Date
          ? row.matched_at.toISOString()
          : typeof row.matched_at === 'string'
            ? row.matched_at
            : String(row.matched_at || ''),
      workout: row.workout
        ? {
          ...row.workout,
          scheduled_date:
            typeof row.workout.scheduled_date === 'string'
              ? row.workout.scheduled_date.split('T')[0]
              : String(row.workout.scheduled_date || ''),
        }
        : undefined,
      activity: row.activity ? normalizeActivityRow(row.activity) : undefined,
    }));
  }

  const store = ensureLocalStore();
  return store.workout_activity_matches
    .map((m) => ({
      ...m,
      workout: store.scheduled_workouts.find((w) => w.id === m.workout_id),
      activity: store.activities.find((a) => a.id === m.activity_id),
    }))
    .filter((m) => m.workout && m.workout.user_id === userId);
}

export async function saveWorkoutActivityMatch(
  match: Omit<WorkoutActivityMatch, 'id' | 'matched_at'>
): Promise<WorkoutActivityMatch> {
  const now = new Date().toISOString();
  if (pgPool) {
    const query = `
      INSERT INTO workout_activity_matches (
        workout_id, activity_id, is_manual_match, completion_percentage,
        distance_delta_meters, duration_delta_seconds, pace_delta_seconds_per_km, matched_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (workout_id) DO UPDATE SET
        activity_id = EXCLUDED.activity_id,
        is_manual_match = EXCLUDED.is_manual_match,
        completion_percentage = EXCLUDED.completion_percentage,
        distance_delta_meters = EXCLUDED.distance_delta_meters,
        duration_delta_seconds = EXCLUDED.duration_delta_seconds,
        pace_delta_seconds_per_km = EXCLUDED.pace_delta_seconds_per_km,
        matched_at = NOW()
      RETURNING *;
    `;
    const res = await pgPool.query(query, [
      match.workout_id,
      match.activity_id,
      match.is_manual_match,
      match.completion_percentage,
      match.distance_delta_meters,
      match.duration_delta_seconds,
      match.pace_delta_seconds_per_km,
    ]);
    return res.rows[0];
  }

  const store = ensureLocalStore();
  const existingIdx = store.workout_activity_matches.findIndex((m) => m.workout_id === match.workout_id);
  const record: WorkoutActivityMatch = {
    ...match,
    id: existingIdx >= 0 ? store.workout_activity_matches[existingIdx].id : crypto.randomUUID(),
    matched_at: now,
  };

  if (existingIdx >= 0) {
    store.workout_activity_matches[existingIdx] = record;
  } else {
    store.workout_activity_matches.push(record);
  }
  saveLocalStore(store);
  return record;
}

