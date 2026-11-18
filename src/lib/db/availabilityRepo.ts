import { pgPool, ensureLocalStore, saveLocalStore, DEFAULT_USER_ID } from './client';
import { AthleteAvailability } from '@/types';

export async function getAthleteAvailability(
  userId: string = DEFAULT_USER_ID
): Promise<AthleteAvailability | null> {
  if (pgPool) {
    const res = await pgPool.query(
      'SELECT * FROM athlete_availability WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1',
      [userId]
    );
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      user_id: r.user_id,
      preferred_days: Array.isArray(r.preferred_days) ? r.preferred_days : ['Tuesday', 'Friday', 'Sunday'],
      preferred_time_of_day: r.preferred_time_of_day || 'MORNING',
      max_session_duration_minutes: Number(r.max_session_duration_minutes ?? 60),
      weekend_duration_minutes: Number(r.weekend_duration_minutes ?? 120),
      fasting_schedule: r.fasting_schedule || { type: 'NONE', is_fasting: false },
      protected_rest_days: Array.isArray(r.protected_rest_days) ? r.protected_rest_days : ['Monday'],
      created_at: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
      updated_at: r.updated_at instanceof Date ? r.updated_at.toISOString() : String(r.updated_at),
    };
  }

  const store = ensureLocalStore();
  const list = ((store as any).athlete_availability || []) as AthleteAvailability[];
  return list.find((a) => a.user_id === userId) || null;
}

export async function upsertAthleteAvailability(
  userId: string = DEFAULT_USER_ID,
  data: Partial<Omit<AthleteAvailability, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<AthleteAvailability> {
  const preferredDays = data.preferred_days || ['Tuesday', 'Friday', 'Sunday'];
  const preferredTime = data.preferred_time_of_day || 'MORNING';
  const weekdayMax = data.max_session_duration_minutes ?? 60;
  const weekendMax = data.weekend_duration_minutes ?? 120;
  const fasting = data.fasting_schedule || { type: 'NONE', is_fasting: false };
  const restDays = data.protected_rest_days || ['Monday'];

  if (pgPool) {
    const res = await pgPool.query(
      `INSERT INTO athlete_availability (
        user_id, preferred_days, preferred_time_of_day,
        max_session_duration_minutes, weekend_duration_minutes,
        fasting_schedule, protected_rest_days, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        preferred_days = EXCLUDED.preferred_days,
        preferred_time_of_day = EXCLUDED.preferred_time_of_day,
        max_session_duration_minutes = EXCLUDED.max_session_duration_minutes,
        weekend_duration_minutes = EXCLUDED.weekend_duration_minutes,
        fasting_schedule = EXCLUDED.fasting_schedule,
        protected_rest_days = EXCLUDED.protected_rest_days,
        updated_at = NOW()
      RETURNING *`,
      [userId, preferredDays, preferredTime, weekdayMax, weekendMax, JSON.stringify(fasting), restDays]
    );
    const r = res.rows[0];
    return {
      id: r.id,
      user_id: r.user_id,
      preferred_days: r.preferred_days,
      preferred_time_of_day: r.preferred_time_of_day,
      max_session_duration_minutes: Number(r.max_session_duration_minutes),
      weekend_duration_minutes: Number(r.weekend_duration_minutes),
      fasting_schedule: r.fasting_schedule,
      protected_rest_days: r.protected_rest_days,
      created_at: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
      updated_at: r.updated_at instanceof Date ? r.updated_at.toISOString() : String(r.updated_at),
    };
  }

  const store = ensureLocalStore();
  if (!(store as any).athlete_availability) (store as any).athlete_availability = [];
  const list = (store as any).athlete_availability as AthleteAvailability[];
  const idx = list.findIndex((a) => a.user_id === userId);
  const now = new Date().toISOString();
  const record: AthleteAvailability = {
    id: idx !== -1 ? list[idx].id : crypto.randomUUID(),
    user_id: userId,
    preferred_days: preferredDays,
    preferred_time_of_day: preferredTime,
    max_session_duration_minutes: weekdayMax,
    weekend_duration_minutes: weekendMax,
    fasting_schedule: fasting,
    protected_rest_days: restDays,
    created_at: idx !== -1 ? list[idx].created_at : now,
    updated_at: now,
  };
  if (idx !== -1) list[idx] = record;
  else list.push(record);
  saveLocalStore(store);
  return record;
}
