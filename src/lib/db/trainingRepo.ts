import { pgPool, ensureLocalStore, saveLocalStore, DEFAULT_USER_ID, formatDateOnly } from './client';
import { TrainingPlan, ScheduledWorkout, WorkoutActivityMatch } from '@/types';
import { normalizeActivityRow } from './activityRepo';

export async function getTrainingPlans(userId: string = DEFAULT_USER_ID): Promise<TrainingPlan[]> {
  if (pgPool) {
    const res = await pgPool.query(
      'SELECT * FROM training_plans WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return res.rows.map((row) => ({
      ...row,
      start_date: formatDateOnly(row.start_date),
      end_date: formatDateOnly(row.end_date),
    }));
  }
  const store = ensureLocalStore();
  return (store.training_plans || []).filter((p) => p.user_id === userId);
}

export async function getActiveTrainingPlan(userId: string = DEFAULT_USER_ID): Promise<TrainingPlan | null> {
  if (pgPool) {
    const res = await pgPool.query(
      'SELECT * FROM training_plans WHERE user_id = $1 AND is_active = TRUE ORDER BY created_at DESC LIMIT 1',
      [userId]
    );
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      ...row,
      start_date: formatDateOnly(row.start_date),
      end_date: formatDateOnly(row.end_date),
    };
  }
  const store = ensureLocalStore();
  return (store.training_plans || []).find((p) => p.user_id === userId && p.is_active) || null;
}

export async function createTrainingPlan(
  plan: Omit<TrainingPlan, 'id' | 'created_at' | 'updated_at'>
): Promise<TrainingPlan> {
  const now = new Date().toISOString();
  if (pgPool) {
    if (plan.is_active) {
      await pgPool.query('UPDATE training_plans SET is_active = FALSE WHERE user_id = $1', [plan.user_id]);
    }
    const query = `
      INSERT INTO training_plans (user_id, title, description, start_date, end_date, is_active, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *;
    `;
    const res = await pgPool.query(query, [
      plan.user_id,
      plan.title,
      plan.description || null,
      plan.start_date,
      plan.end_date,
      plan.is_active ?? true,
    ]);
    const row = res.rows[0];
    return {
      ...row,
      start_date:
        row.start_date instanceof Date
          ? row.start_date.toISOString().split('T')[0]
          : String(row.start_date || '').split('T')[0],
      end_date:
        row.end_date instanceof Date
          ? row.end_date.toISOString().split('T')[0]
          : String(row.end_date || '').split('T')[0],
    };
  }
  const store = ensureLocalStore();
  if (!store.training_plans) store.training_plans = [];
  if (plan.is_active) {
    store.training_plans.forEach((p) => {
      if (p.user_id === plan.user_id) p.is_active = false;
    });
  }
  const created: TrainingPlan = {
    ...plan,
    id: crypto.randomUUID(),
    created_at: now,
    updated_at: now,
  };
  store.training_plans.push(created);
  saveLocalStore(store);
  return created;
}

export async function deleteTrainingPlansByUserId(userId: string = DEFAULT_USER_ID): Promise<void> {
  if (pgPool) {
    await pgPool.query('DELETE FROM training_plans WHERE user_id = $1', [userId]);
    return;
  }
  const store = ensureLocalStore();
  store.training_plans = (store.training_plans || []).filter((p) => p.user_id !== userId);
  saveLocalStore(store);
}

export async function getScheduledWorkouts(
  userId: string = DEFAULT_USER_ID,
  startDate?: string,
  endDate?: string
): Promise<ScheduledWorkout[]> {
  if (pgPool) {
    let query = 'SELECT * FROM scheduled_workouts WHERE user_id = $1';
    const params: any[] = [userId];

    if (startDate) {
      params.push(startDate);
      query += ` AND scheduled_date >= $${params.length}`;
    }
    if (endDate) {
      params.push(endDate);
      query += ` AND scheduled_date <= $${params.length}`;
    }
    query += ' ORDER BY scheduled_date ASC';
    const res = await pgPool.query(query, params);
    return res.rows.map((row) => ({
      ...row,
      scheduled_date: formatDateOnly(row.scheduled_date),
    }));
  }

  const store = ensureLocalStore();
  let workouts = store.scheduled_workouts.filter((w) => w.user_id === userId);
  if (startDate) {
    workouts = workouts.filter((w) => w.scheduled_date >= startDate);
  }
  if (endDate) {
    workouts = workouts.filter((w) => w.scheduled_date <= endDate);
  }
  workouts.sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date));
  return workouts;
}

export async function createScheduledWorkout(
  workout: Omit<ScheduledWorkout, 'id' | 'created_at' | 'updated_at'>
): Promise<ScheduledWorkout> {
  const now = new Date().toISOString();
  if (pgPool) {
    const query = `
      INSERT INTO scheduled_workouts (
        user_id, plan_id, scheduled_date, workout_category, target_distance_meters,
        target_duration_seconds, target_pace_seconds_per_km, target_intensity, description, status, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      RETURNING *;
    `;
    const res = await pgPool.query(query, [
      workout.user_id,
      workout.plan_id || null,
      workout.scheduled_date,
      workout.workout_category,
      workout.target_distance_meters || null,
      workout.target_duration_seconds || null,
      workout.target_pace_seconds_per_km || null,
      workout.target_intensity || null,
      workout.description || null,
      workout.status || 'PLANNED',
    ]);
    const row = res.rows[0];
    return {
      ...row,
      scheduled_date:
        row.scheduled_date instanceof Date
          ? row.scheduled_date.toISOString().split('T')[0]
          : typeof row.scheduled_date === 'string'
            ? row.scheduled_date.split('T')[0]
            : String(row.scheduled_date || ''),
    };
  }

  const store = ensureLocalStore();
  const created: ScheduledWorkout = {
    ...workout,
    id: crypto.randomUUID(),
    created_at: now,
    updated_at: now,
  };
  store.scheduled_workouts.push(created);
  saveLocalStore(store);
  return created;
}

export async function updateScheduledWorkout(
  id: string,
  updates: Partial<ScheduledWorkout>
): Promise<ScheduledWorkout | null> {
  const now = new Date().toISOString();
  if (pgPool) {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const [key, val] of Object.entries(updates)) {
      if (['id', 'created_at', 'user_id'].includes(key)) continue;
      fields.push(`${key} = $${idx++}`);
      values.push(val);
    }
    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `UPDATE scheduled_workouts SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    const res = await pgPool.query(query, values);
    return res.rows[0] || null;
  }

  const store = ensureLocalStore();
  const idx = store.scheduled_workouts.findIndex((w) => w.id === id);
  if (idx < 0) return null;

  store.scheduled_workouts[idx] = {
    ...store.scheduled_workouts[idx],
    ...updates,
    updated_at: now,
  };
  saveLocalStore(store);
  return store.scheduled_workouts[idx];
}

export async function deleteScheduledWorkout(id: string): Promise<boolean> {
  if (pgPool) {
    const res = await pgPool.query('DELETE FROM scheduled_workouts WHERE id = $1', [id]);
    return (res.rowCount || 0) > 0;
  }

  const store = ensureLocalStore();
  const initialLen = store.scheduled_workouts.length;
  store.scheduled_workouts = store.scheduled_workouts.filter((w) => w.id !== id);
  store.workout_activity_matches = store.workout_activity_matches.filter((m) => m.workout_id !== id);
  saveLocalStore(store);
  return store.scheduled_workouts.length < initialLen;
}

export async function deleteScheduledWorkoutsByUserId(userId: string = DEFAULT_USER_ID): Promise<void> {
  if (pgPool) {
    await pgPool.query('DELETE FROM scheduled_workouts WHERE user_id = $1', [userId]);
    return;
  }
  const store = ensureLocalStore();
  const deletedIds = new Set(store.scheduled_workouts.filter((w) => w.user_id === userId).map((w) => w.id));
  store.scheduled_workouts = store.scheduled_workouts.filter((w) => w.user_id !== userId);
  store.workout_activity_matches = store.workout_activity_matches.filter((m) => !deletedIds.has(m.workout_id));
  saveLocalStore(store);
}

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
