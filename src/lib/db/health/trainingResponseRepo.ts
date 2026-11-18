import { pgPool, ensureLocalStore, saveLocalStore, DEFAULT_USER_ID } from '../client';
import { AthleteTrainingResponse } from '@/types';

export async function getAthleteTrainingResponses(
  userId: string = DEFAULT_USER_ID,
  limit: number = 20
): Promise<AthleteTrainingResponse[]> {
  if (pgPool) {
    const res = await pgPool.query(
      'SELECT * FROM athlete_training_responses WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
      [userId, limit]
    );
    return res.rows.map((r) => ({
      ...r,
      distance_km: Number(r.distance_km),
      duration_seconds: Number(r.duration_seconds),
      rpe_score: r.rpe_score !== null ? Number(r.rpe_score) : null,
      pain_during_activity: r.pain_during_activity !== null ? Number(r.pain_during_activity) : null,
      pain_after_activity: r.pain_after_activity !== null ? Number(r.pain_after_activity) : null,
      pain_next_day: r.pain_next_day !== null ? Number(r.pain_next_day) : null,
      swelling_observed: Boolean(r.swelling_observed),
      instability_observed: Boolean(r.instability_observed),
    }));
  }

  const store = ensureLocalStore();
  return store.athlete_training_responses.filter((r) => r.user_id === userId).slice(0, limit);
}

export async function upsertAthleteTrainingResponse(
  resp: Omit<AthleteTrainingResponse, 'id' | 'created_at'>
): Promise<AthleteTrainingResponse> {
  if (pgPool) {
    const res = await pgPool.query(
      `INSERT INTO athlete_training_responses (
        user_id, activity_id, strava_activity_id, sport_type, distance_km,
        duration_seconds, rpe_score, pain_during_activity, pain_after_activity,
        pain_next_day, swelling_observed, instability_observed,
        fatigue_response, athlete_comments, checkin_completed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      ON CONFLICT (user_id, activity_id) DO UPDATE SET
        rpe_score = EXCLUDED.rpe_score,
        pain_during_activity = EXCLUDED.pain_during_activity,
        pain_after_activity = EXCLUDED.pain_after_activity,
        pain_next_day = EXCLUDED.pain_next_day,
        swelling_observed = EXCLUDED.swelling_observed,
        instability_observed = EXCLUDED.instability_observed,
        fatigue_response = EXCLUDED.fatigue_response,
        athlete_comments = EXCLUDED.athlete_comments,
        checkin_completed_at = NOW()
      RETURNING *`,
      [
        resp.user_id,
        resp.activity_id || null,
        resp.strava_activity_id || null,
        resp.sport_type,
        resp.distance_km,
        resp.duration_seconds,
        resp.rpe_score ?? null,
        resp.pain_during_activity ?? null,
        resp.pain_after_activity ?? null,
        resp.pain_next_day ?? null,
        Boolean(resp.swelling_observed),
        Boolean(resp.instability_observed),
        resp.fatigue_response || 'NORMAL',
        resp.athlete_comments || null,
        resp.checkin_completed_at || new Date().toISOString(),
      ]
    );
    const r = res.rows[0];
    return {
      ...r,
      distance_km: Number(r.distance_km),
      duration_seconds: Number(r.duration_seconds),
      rpe_score: r.rpe_score !== null ? Number(r.rpe_score) : null,
      pain_during_activity: r.pain_during_activity !== null ? Number(r.pain_during_activity) : null,
      pain_after_activity: r.pain_after_activity !== null ? Number(r.pain_after_activity) : null,
      pain_next_day: r.pain_next_day !== null ? Number(r.pain_next_day) : null,
      swelling_observed: Boolean(r.swelling_observed),
      instability_observed: Boolean(r.instability_observed),
    };
  }

  const store = ensureLocalStore();
  const idx = store.athlete_training_responses.findIndex(
    (r) => r.user_id === resp.user_id && r.activity_id === resp.activity_id
  );
  const record: AthleteTrainingResponse = {
    ...resp,
    id: idx !== -1 ? store.athlete_training_responses[idx].id : crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  if (idx !== -1) {
    store.athlete_training_responses[idx] = record;
  } else {
    store.athlete_training_responses.unshift(record);
  }
  saveLocalStore(store);
  return record;
}

